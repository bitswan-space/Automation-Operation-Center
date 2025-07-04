import logging

from django.template.defaultfilters import slugify

from bitswan_backend.core.services.keycloak import KeycloakService

logger = logging.getLogger(__name__)


class KeycloakMixin:
    """
    Mixin to add Keycloak helper methods.
    """

    keycloak = KeycloakService()

    def get_active_user_org_id(self):
        """
        Helper method to get the Keycloak group ID
        """

        org_id = self.keycloak.get_active_user_org(self.request).get("id")
        logger.info("Got user group: %s", org_id)

        return org_id

    def get_active_user_org_name_slug(self):
        """
        Helper method to get the Keycloak group name slug
        """

        org_id = self.get_active_user_org_id()

        org = self.keycloak.get_org_by_id(org_id)

        org_name_slug = slugify(org["name"])
        logger.info("Got user group name slug: %s", org_name_slug)

        return org_name_slug

    def get_org_groups(self):
        """
        Helper method to get the Keycloak group ID
        """

        org_id = self.keycloak.get_active_user_org(self.request).get("id")

        org_groups = self.keycloak.get_org_groups(org_id=org_id)
        logger.info("Got user org sub groups: %s", org_groups)

        return org_groups

    def create_org_group(self, name, attributes):
        """
        Helper method to create a new Keycloak group
        """

        org_id = self.keycloak.get_active_user_org(self.request).get("id")

        org_group = self.keycloak.create_group(
            org_id=org_id,
            name=name,
            attributes=attributes,
        )
        logger.info("Created user org group: %s", org_group)

        return org_group

    def get_org_group(self, group_id):
        """
        Helper method to get a Keycloak group
        """

        org_group = self.keycloak.get_org_group(group_id=group_id)
        logger.info("Got org group when updating: %s", org_group)
        return org_group

    def update_org_group(self, group_id, name, attributes):
        """
        Helper method to update a Keycloak group
        """

        self.keycloak.update_org_group(
            group_id=group_id,
            name=name,
            attributes=attributes,
        )
        logger.info("Updated user org group: %s", group_id)

        return group_id

    def delete_org_group(self, group_id):
        """
        Helper method to delete a Keycloak group
        """

        self.keycloak.delete_group(group_id=group_id)
        logger.info("Deleted user org group: %s", group_id)

        return group_id

    def get_org_users(self):
        """
        Helper method to get the Keycloak group ID
        """

        org_id = self.keycloak.get_active_user_org(self.request).get("id")

        return self.keycloak.get_org_users(org_id=org_id)

    def add_user_to_group(self, group_id, user_id):
        """
        Helper method to add a user to a group
        """

        self.keycloak.add_user_to_org_group(org_group_id=group_id, user_id=user_id)

    def remove_user_from_group(self, group_id, user_id):
        """
        Helper method to remove a user from a group
        """

        self.keycloak.remove_user_from_org_group(org_group_id=group_id, user_id=user_id)

    def invite_user_to_org(self, email):
        """
        Helper method to invite a user to the org
        """

        org = self.keycloak.get_active_user_org(self.request)
        org_id = org.get("id")

        self.keycloak.invite_user_to_org(email=email, org_id=org_id)

    def delete_user(self, user_id):
        """
        Helper method to delete a user
        """
        self.keycloak.delete_user(user_id=user_id)

    def get_org_group_mqtt_profiles(self):
        """
        Helper method to get the Keycloak group ID
        """

        return self.keycloak.get_org_group_mqtt_profiles(self.request)

    def start_device_registration(self):
        """
        Helper method to start device registration
        """

        return self.keycloak.start_device_registration()
    
    def get_user_org_id(self, token):
        """
        Helper method to get the user org ID
        """

        return self.keycloak.get_user_org_id(token)

    def poll_device_registration(self, device_code):
        """
        Helper method to poll device registration
        """

        return self.keycloak.poll_device_registration(device_code)

    def confirm_device_registration(self, device_code):
        """
        Helper method to confirm device registration
        """

        return self.keycloak.confirm_device_registration(device_code)
    
    def get_token_from_token(self, request):
        """
        Helper method to get a token from a token
        """

        return self.keycloak.get_token_from_token(request)

    def is_admin(self, request):
        """
        Helper method to check if the user is an admin
        """
        return self.keycloak.is_admin(request)
