# Generated by Django 4.2.10 on 2025-05-11 12:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspaces', '0006_alter_workspace_automation_server'),
    ]

    operations = [
        migrations.AddField(
            model_name='workspace',
            name='editor_url',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
