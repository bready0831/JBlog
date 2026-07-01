SUPABASE_ANON_KEY ?= $(shell grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local 2>/dev/null | cut -d= -f2)
SUPABASE_FUNCTIONS_URL = https://ipoapbobbdqkrbjswbsd.supabase.co/functions/v1

.PHONY: dev db-push \
	deploy-sync deploy-sync-all sync-post sync-all \
	deploy-sync-books deploy-sync-books-all sync-books sync-books-all \
	deploy

dev:
	npm run dev

db-push:
	supabase db push

# ── Posts ────────────────────────────────────────────────────────
deploy-sync:
	supabase functions deploy sync-notion-posts --use-api --no-verify-jwt

deploy-sync-all:
	supabase functions deploy sync-notion-posts-all --use-api --no-verify-jwt

sync-post:
	curl -X POST $(SUPABASE_FUNCTIONS_URL)/sync-notion-posts \
		-H "Content-Type: application/json" -d '{}'

sync-all:
	curl -X POST $(SUPABASE_FUNCTIONS_URL)/sync-notion-posts-all \
		-H "Content-Type: application/json" -d '{}'

# ── Books ─────────────────────────────────────────────────────────
deploy-sync-books:
	supabase functions deploy sync-notion-books --use-api --no-verify-jwt

deploy-sync-books-all:
	supabase functions deploy sync-notion-books-all --use-api --no-verify-jwt

sync-books:
	curl -X POST $(SUPABASE_FUNCTIONS_URL)/sync-notion-books \
		-H "Content-Type: application/json" -d '{}'

sync-books-all:
	curl -X POST $(SUPABASE_FUNCTIONS_URL)/sync-notion-books-all \
		-H "Content-Type: application/json" -d '{}'

# ── All ───────────────────────────────────────────────────────────
deploy: db-push deploy-sync deploy-sync-all deploy-sync-books deploy-sync-books-all


