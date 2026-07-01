SUPABASE_ANON_KEY ?= $(shell grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local 2>/dev/null | cut -d= -f2)

.PHONY: dev db-push deploy-sync deploy-sync-all deploy sync-all curl-sync-all

dev:
	npm run dev

db-push:
	supabase db push

deploy-sync:
	supabase functions deploy sync-notion-posts --use-api --no-verify-jwt

sync-post:
	curl -X POST https://ipoapbobbdqkrbjswbsd.supabase.co/functions/v1/sync-notion-posts \
		-H "Content-Type: application/json" \
		-d '{}'

deploy-sync-all:
	supabase functions deploy sync-notion-posts-all --use-api --no-verify-jwt

sync-all:
	curl -X POST https://ipoapbobbdqkrbjswbsd.supabase.co/functions/v1/sync-notion-posts-all \
		-H "Content-Type: application/json" \
		-d '{}'

deploy: db-push deploy-sync deploy-sync-all


