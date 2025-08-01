from rest_framework import serializers
import uuid

from bitswan_backend.workspaces.models import AutomationServer
from bitswan_backend.workspaces.models import Workspace
from bitswan_backend.core.services.keycloak import KeycloakService


class WorkspaceSerializer(serializers.ModelSerializer):
    automation_server_id = serializers.SlugRelatedField(
        source="automation_server",
        slug_field="automation_server_id",
        queryset=AutomationServer.objects.all(),
        write_only=True,
    )
    # Display the automation server's ID (external ID) in a readable way
    automation_server = serializers.SlugRelatedField(
        slug_field="automation_server_id",
        read_only=True,
    )
    keycloak_org_id = serializers.CharField(read_only=True)

    def validate(self, attrs):
        if not attrs.get("automation_server"):
            message = "Automation server not found for workspace."
            raise serializers.ValidationError(message)

        return attrs

    def create(self, validated_data):
        automation_server = validated_data.get("automation_server")
        return Workspace.objects.create(
            **validated_data,
            keycloak_org_id=automation_server.keycloak_org_id,
        )

    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "keycloak_org_id",
            "automation_server",
            "automation_server_id",
            "editor_url",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class AutomationServerSerializer(serializers.ModelSerializer):
    workspaces = WorkspaceSerializer(many=True, read_only=True)

    class Meta:
        model = AutomationServer
        fields = [
            "id",
            "name",
            "automation_server_id",
            "keycloak_org_id",
            "workspaces",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "created_at",
            "updated_at",
        ]


class CreateAutomationServerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationServer
        fields = [
            "name",
            "keycloak_org_id",
        ]

    def validate(self, attrs):
        automation_server = AutomationServer.objects.filter(
            name=attrs.get("name"),
            keycloak_org_id=attrs.get("keycloak_org_id"),
        ).first()
        if automation_server:
            message = "Automation server already exists."
            raise serializers.ValidationError(message)

        keycloak_service = KeycloakService()

        request = self.context.get("request")

        user_orgs = keycloak_service.get_active_user_orgs(request)
        user_org_ids = [org.get("id") for org in user_orgs]

        if attrs.get("keycloak_org_id") not in user_org_ids:
            message = "User does not have access to this organization."
            raise serializers.ValidationError(message)

        return attrs

    def create(self, validated_data):
        server = AutomationServer.objects.create(
            name=validated_data.get("name"),
            automation_server_id=uuid.uuid4(),
            keycloak_org_id=validated_data.get("keycloak_org_id"),
        )

        return {
            "automation_server_id": server.automation_server_id,
        }
