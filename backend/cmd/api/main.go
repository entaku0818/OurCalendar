package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"

	"github.com/entaku0818/OurCalendar/backend/internal/handler"
)

func main() {
	// Load .env file in development
	if os.Getenv("ENV") != "production" {
		godotenv.Load()
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes
		r.Route("/auth", func(r chi.Router) {
			r.Post("/google", handler.GoogleAuth)
			r.Post("/line", handler.LineAuth)
		})

		// User routes (requires auth)
		r.Route("/users", func(r chi.Router) {
			r.Get("/me", handler.GetCurrentUser)
			r.Put("/me", handler.UpdateUser)
		})

		// Group routes
		r.Route("/groups", func(r chi.Router) {
			r.Get("/", handler.ListGroups)
			r.Post("/", handler.CreateGroup)
			r.Get("/{groupID}", handler.GetGroup)
			r.Put("/{groupID}", handler.UpdateGroup)
			r.Delete("/{groupID}", handler.DeleteGroup)
			r.Post("/{groupID}/join", handler.JoinGroup)
			r.Post("/{groupID}/leave", handler.LeaveGroup)
		})

		// Event routes
		r.Route("/events", func(r chi.Router) {
			r.Get("/", handler.ListEvents)
			r.Post("/", handler.CreateEvent)
			r.Get("/{eventID}", handler.GetEvent)
			r.Put("/{eventID}", handler.UpdateEvent)
			r.Delete("/{eventID}", handler.DeleteEvent)
		})
	})

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
