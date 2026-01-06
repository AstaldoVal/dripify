#!/bin/bash

echo "🔍 Проверка статуса Git репозитория..."
echo ""

# Проверка наличия .git директории
if [ ! -d ".git" ]; then
    echo "❌ Git репозиторий НЕ инициализирован!"
    echo ""
    echo "📝 Для инициализации выполните:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo ""
    echo "Или запустите: ./setup-git.sh"
    exit 1
fi

echo "✅ Git репозиторий найден"
echo ""

# Статус репозитория
echo "📊 Статус репозитория:"
git status --short
echo ""

# Проверка незакоммиченных изменений
UNTRACKED=$(git ls-files --others --exclude-standard | wc -l | tr -d ' ')
MODIFIED=$(git diff --name-only | wc -l | tr -d ' ')
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')

echo "📈 Статистика:"
echo "   - Неотслеживаемых файлов: $UNTRACKED"
echo "   - Измененных файлов: $MODIFIED"
echo "   - Файлов в staging: $STAGED"
echo ""

# Список неотслеживаемых файлов
if [ "$UNTRACKED" -gt 0 ]; then
    echo "📁 Неотслеживаемые файлы:"
    git ls-files --others --exclude-standard | head -10
    if [ "$UNTRACKED" -gt 10 ]; then
        echo "   ... и еще $((UNTRACKED - 10)) файлов"
    fi
    echo ""
fi

# Список измененных файлов
if [ "$MODIFIED" -gt 0 ]; then
    echo "✏️  Измененные файлы (не в staging):"
    git diff --name-only | head -10
    if [ "$MODIFIED" -gt 10 ]; then
        echo "   ... и еще $((MODIFIED - 10)) файлов"
    fi
    echo ""
fi

# Список файлов в staging
if [ "$STAGED" -gt 0 ]; then
    echo "📦 Файлы в staging (готовы к коммиту):"
    git diff --cached --name-only | head -10
    if [ "$STAGED" -gt 10 ]; then
        echo "   ... и еще $((STAGED - 10)) файлов"
    fi
    echo ""
fi

# Проверка последних коммитов
echo "📜 Последние коммиты:"
git log --oneline -5 2>/dev/null || echo "   Нет коммитов"
echo ""

# Итоговый статус
if [ "$UNTRACKED" -eq 0 ] && [ "$MODIFIED" -eq 0 ] && [ "$STAGED" -eq 0 ]; then
    echo "✅ Все файлы закоммичены!"
else
    echo "⚠️  Есть незакоммиченные изменения!"
    echo ""
    echo "💡 Для добавления всех изменений:"
    echo "   git add ."
    echo "   git commit -m 'Описание изменений'"
fi





