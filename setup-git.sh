#!/bin/bash

# Скрипт для инициализации Git репозитория и первого коммита

echo "🚀 Инициализация Git репозитория..."

# Инициализация git
git init

# Добавление всех файлов
echo "📦 Добавление файлов..."
git add .

# Проверка статуса
echo "📊 Статус репозитория:"
git status

# Создание первого коммита
echo "💾 Создание первого коммита..."
git commit -m "Initial commit: Dripify Lead Management Platform

- Vue 3 SPA with Webpack
- Lead management with AI-powered stages
- Inline filter builder (Atlassian-style)
- Kanban and Table views
- Drag-and-drop functionality
- Dark/Light theme support
- Custom lead stages management"

echo ""
echo "✅ Git репозиторий инициализирован!"
echo ""
echo "📝 Следующие шаги:"
echo "1. Создайте репозиторий на GitHub/GitLab"
echo "2. Выполните:"
echo "   git remote add origin <YOUR_REPO_URL>"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🌐 Для деплоя на Vercel смотрите QUICK_DEPLOY.md"

