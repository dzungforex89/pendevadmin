# Script to fix relatedArticles column issue
# This script will:
# 1. Add the column to database using Prisma db push
# 2. Generate Prisma Client

Write-Host "Adding relatedArticles column to database..." -ForegroundColor Yellow
npx prisma db push --accept-data-loss

Write-Host "Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Done! Please restart your server." -ForegroundColor Green

