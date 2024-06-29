.PHONY: all backend frontend

all: backend frontend

backend:
	cd backend && npm i

frontend:
	cd frontend && npm i && npm run build
