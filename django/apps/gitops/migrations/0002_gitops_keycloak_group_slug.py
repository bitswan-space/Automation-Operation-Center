# Generated by Django 4.2.10 on 2024-02-29 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gitops', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='gitops',
            name='keycloak_group_slug',
            field=models.SlugField(default='test-slug', max_length=100),
            preserve_default=False,
        ),
    ]
