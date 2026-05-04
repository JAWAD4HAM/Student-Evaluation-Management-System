from django.contrib import admin

from .models import Cours, Filiere, Module


class CoursInline(admin.TabularInline):
    model = Cours
    extra = 0
    max_num = 2


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 0


@admin.register(Filiere)
class FiliereAdmin(admin.ModelAdmin):
    list_display = ("id_filiere", "nom")
    search_fields = ("id_filiere", "nom")
    inlines = [ModuleInline]


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ("id_module", "nom", "filiere")
    search_fields = ("id_module", "nom", "filiere__nom")
    list_filter = ("filiere",)
    inlines = [CoursInline]


@admin.register(Cours)
class CoursAdmin(admin.ModelAdmin):
    list_display = ("id_cours", "nom", "module")
    search_fields = ("id_cours", "nom", "module__nom")
    list_filter = ("module__filiere", "module")
