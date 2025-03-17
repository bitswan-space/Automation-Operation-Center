import subprocess
import time
from dataclasses import dataclass
from pathlib import Path

import click
import requests
from keycloak import KeycloakAdmin, KeycloakPostError

from aoc_cli.env.config import (
    BITSWAN_BACKEND_DOCKER_ENV_FILE,
    BITSWAN_BACKEND_LOCAL_ENV_FILE,
    KEYCLOAK_ENV_FILE,
    OPERATIONS_CENTRE_DOCKER_ENV_FILE,
    OPERATIONS_CENTRE_LOCAL_ENV_FILE,
    DevSetupKind,
    Environment,
)
from aoc_cli.env.utils import get_env_path
from aoc_cli.utils.env import get_env_value
from aoc_cli.utils.tools import get_aoc_working_directory


@dataclass
class KeycloakConfig:
    admin_username: str
    admin_password: str
    aoc_dir: Path
    realm_name: str = "master"
    server_url: str = "http://localhost:8080"
    management_url: str = "http://localhost:9000"
    verify: bool = False
    org_name: str = "Example Org"
    env: Environment = Environment.DEV
    dev_setup: DevSetupKind = DevSetupKind.DOCKER


class KeycloakService:
    def __init__(self, config: KeycloakConfig):
        self.config = config
        self.keycloak_admin = None

    def setup(self) -> None:
        self.start_services()
        self.wait_for_service()
        self.connect()

        client_secrets = self.create_clients()

        self.initialize_admin_user()

        self._update_envs_with_keycloak_secret(client_secrets)
        click.echo("✓ Keycloak setup complete")

    def start_services(self) -> None:
        cwd = get_aoc_working_directory(self.config.env, self.config.aoc_dir)
        subprocess.run(
            [
                "docker",
                "compose",
                "-f",
                f"docker-compose.{self.config.env.value}.yml",
                "up",
                "-d",
                "keycloak",
                "keycloak-postgres",
            ],
            cwd=cwd,
            check=True,
            shell=False,
            stdout=subprocess.DEVNULL,
        )

    def wait_for_service(self, max_retries: int = 30, delay: int = 10) -> None:
        click.echo("Waiting for Keycloak to be ready...")
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    f"{self.config.management_url}/health", verify=self.config.verify
                )
                if response.status_code == 200:
                    click.echo("Keycloak is ready")
                    return
            except requests.RequestException:
                if attempt < max_retries - 1:
                    time.sleep(delay)
                else:
                    raise TimeoutError("Keycloak failed to start")

    def connect(self) -> None:
        keycloak_env_path = get_env_path(self.config.env, KEYCLOAK_ENV_FILE)
        username = get_env_value(keycloak_env_path, "KEYCLOAK_ADMIN")
        password = get_env_value(keycloak_env_path, "KEYCLOAK_ADMIN_PASSWORD")

        self.keycloak_admin = KeycloakAdmin(
            server_url=self.config.server_url,
            username=username,
            password=password,
            realm_name=self.config.realm_name,
            verify=self.config.verify,
        )

    def create_clients(self) -> dict:
        # Client configurations
        clients = {
            "aoc-frontend": {
                "clientId": "aoc-frontend",
                "publicClient": False,
                "redirectUris": ["*"],
                "webOrigins": ["*"],
                "serviceAccountsEnabled": True,
                "authorizationServicesEnabled": False,
                "standardFlowEnabled": True,
                "directAccessGrantsEnabled": True,
                "implicitFlowEnabled": False,
            },
            "bitswan-backend": {
                "clientId": "bitswan-backend",
                "webOrigins": ["*"],
                "publicClient": False,
                "serviceAccountsEnabled": True,
                "authorizationServicesEnabled": True,
                "directAccessGrantsEnabled": True,
                "implicitFlowEnabled": True,
                "standardFlowEnabled": True,
            },
        }

        # Role mappings for each client
        roles_mapping = {
            "aoc-frontend": [
                "admin",
                "view-users",
                "view-clients",
                "query-groups",
                "query-users",
                "query-clients",
                "manage-clients",
                "view-groups",
            ],
            "bitswan-backend": [
                "view-users",
                "query-groups",
                "manage-users",
                "query-users",
                "view-groups",
            ],
        }

        existing_clients = self.keycloak_admin.get_clients()
        client_ids = [client.get("id") for client in existing_clients]

        client_available_roles = {}
        for client_id in client_ids:
            roles = self.keycloak_admin.get_client_roles(client_id)
            client_available_roles[client_id] = {role["name"]: role for role in roles}

        client_secrets = {}

        for name, client_config in clients.items():
            try:
                client_id = self.keycloak_admin.create_client(client_config)
                print(f"Client ID: {client_id}")
            except KeycloakPostError as e:
                if e.response_code == 409:
                    print(f"Client {name} already exists")
                    continue
                else:
                    raise e

            service_account_user = self.keycloak_admin.get_client_service_account_user(
                client_id
            )
            service_account_user_id = service_account_user.get("id")

            # Group roles by client ID to minimize API calls
            roles_by_client = {}
            desired_roles = roles_mapping.get(name, [])

            for existing_client_id, available_roles in client_available_roles.items():
                matching_roles = []
                for role_name in desired_roles:
                    if role_name in available_roles:
                        role = available_roles[role_name]
                        matching_roles.append(role)

                if matching_roles:
                    roles_by_client[existing_client_id] = matching_roles

            # Assign roles grouped by client
            for container_client_id, roles in roles_by_client.items():
                self.keycloak_admin.assign_client_role(
                    service_account_user_id, container_client_id, roles
                )

            client_secrets[name] = self.keycloak_admin.get_client_secrets(
                client_id
            ).get("value", "")

        return client_secrets

    def initialize_admin_user(self) -> None:

        try:
            user_id = self.keycloak_admin.create_user(
                {
                    "username": self.config.admin_username,
                    "email": self.config.admin_username,
                    "enabled": True,
                    "credentials": [
                        {
                            "type": "password",
                            "value": self.config.admin_password,
                            "temporary": False,
                        }
                    ],
                }
            )
        except KeycloakPostError as e:
            if e.response_code == 409:
                click.echo("Admin user already exists")
                return
            else:
                raise e

        org_group_id = self.keycloak_admin.create_group(
            {"name": self.config.org_name, "attributes": {"type": ["org"]}}
        )

        admin_group_id = self.keycloak_admin.create_group(
            {"name": "admin", "attributes": {"tags": ["view-users"]}},
            parent=org_group_id,
            skip_exists=True,
        )

        self.keycloak_admin.group_user_add(user_id, admin_group_id)
        self.keycloak_admin.group_user_add(user_id, org_group_id)

    def _update_envs_with_keycloak_secret(self, secret: dict) -> None:
        aoc_env_file = (
            OPERATIONS_CENTRE_DOCKER_ENV_FILE
            if self.config.dev_setup == DevSetupKind.DOCKER
            else OPERATIONS_CENTRE_LOCAL_ENV_FILE
        )

        bitswan_backend_env_file = (
            BITSWAN_BACKEND_DOCKER_ENV_FILE
            if self.config.dev_setup == DevSetupKind.DOCKER
            else BITSWAN_BACKEND_LOCAL_ENV_FILE
        )

        env_updates = {
            "aoc": (
                "KEYCLOAK_CLIENT_SECRET",
                "aoc-frontend",
                self.config.dev_setup.value,
                aoc_env_file,
            ),
            "bitswan-backend": (
                "KEYCLOAK_CLIENT_SECRET_KEY",
                "bitswan-backend",
                self.config.dev_setup.value,
                bitswan_backend_env_file,
            ),
        }

        click.echo(f"Updating {env_updates}")

        try:

            for project_name, (
                env_var_label,
                client_name,
                deployment_kind,
                env_file,
            ) in env_updates.items():

                file_path = get_env_path(
                    self.config.env,
                    env_file=env_file,
                    dev_setup=deployment_kind,
                    project_name=project_name,
                )
                click.echo(f"Updating {file_path}")
                with open(file_path, "a") as f:
                    if client_name in secret:
                        f.write(f"\n{env_var_label}={secret.get(client_name)}\n")
        except Exception as e:
            click.echo(f"Error updating {env_file}: {e}")
