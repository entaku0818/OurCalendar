package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/joho/godotenv"

	"github.com/entaku0818/OurCalendar/backend/internal/config"
	"github.com/entaku0818/OurCalendar/backend/internal/handler"
	"github.com/entaku0818/OurCalendar/backend/internal/middleware"
	"github.com/entaku0818/OurCalendar/backend/internal/repository"
	"github.com/entaku0818/OurCalendar/backend/internal/service"
)

func main() {
	// Load .env file in development
	if os.Getenv("ENV") != "production" {
		godotenv.Load()
	}

	cfg := config.Load()

	// Initialize database connection
	db, err := repository.NewDB(cfg.SupabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	groupRepo := repository.NewGroupRepository(db)
	eventRepo := repository.NewEventRepository(db)
	settingsRepo := repository.NewSettingsRepository(db)

	// Initialize services
	authService := service.NewAuthService(cfg, userRepo, settingsRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userRepo, settingsRepo)
	groupHandler := handler.NewGroupHandler(groupRepo)
	eventHandler := handler.NewEventHandler(eventRepo, groupRepo)

	r := chi.NewRouter()

	// Middleware
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.RequestID)
	r.Use(middleware.CORS())

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK"))
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes (public)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/google", authHandler.GoogleAuth)
			r.Post("/refresh", authHandler.RefreshToken)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.Auth(authService))

			// User routes
			r.Route("/users", func(r chi.Router) {
				r.Get("/me", userHandler.GetCurrentUser)
				r.Put("/me", userHandler.UpdateUser)
			})

			// Settings routes
			r.Route("/settings", func(r chi.Router) {
				r.Get("/", userHandler.GetSettings)
				r.Put("/", userHandler.UpdateSettings)
			})

			// Group routes
			r.Route("/groups", func(r chi.Router) {
				r.Get("/", groupHandler.ListGroups)
				r.Post("/", groupHandler.CreateGroup)
				r.Post("/join", groupHandler.JoinGroup)
				r.Get("/{groupID}", groupHandler.GetGroup)
				r.Put("/{groupID}", groupHandler.UpdateGroup)
				r.Delete("/{groupID}", groupHandler.DeleteGroup)
				r.Post("/{groupID}/leave", groupHandler.LeaveGroup)
				r.Delete("/{groupID}/members/{userID}", groupHandler.RemoveMember)
			})

			// Event routes
			r.Route("/events", func(r chi.Router) {
				r.Get("/", eventHandler.ListEvents)
				r.Post("/", eventHandler.CreateEvent)
				r.Get("/{eventID}", eventHandler.GetEvent)
				r.Put("/{eventID}", eventHandler.UpdateEvent)
				r.Delete("/{eventID}", eventHandler.DeleteEvent)
			})
		})
	})

	log.Printf("Server starting on port %s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
}
