# ShowTracker - TV Show Tracking Application

## Overview

ShowTracker is a full-stack web application for tracking TV shows across different streaming platforms. Users can manage their shows in three categories: Currently Watching, Plan to Watch, and Completed. The application features a clean, modern interface with instant tab switching, automatic image fetching for shows, and simple username-based authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon serverless PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon serverless platform
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Location**: Shared schema definitions in `/shared/schema.ts`
- **Migrations**: Handled via Drizzle Kit with migration files in `/migrations`

## Key Components

### Database Schema
- **Users Table**: Simple user management with username-only authentication
- **Shows Table**: TV show records with title, platform, status, image URL, and timestamps
- **Relationships**: Shows are linked to users via foreign key

### Authentication System
- Username-only authentication (no passwords required)
- Session-based authentication using Express sessions
- Automatic user creation on first login
- Session storage in PostgreSQL using connect-pg-simple

### Image Management
- **Primary Strategy**: Google Custom Search API for show poster images
- **Fallback Strategy**: TMDB (The Movie Database) API integration
- **Error Handling**: Default fallback image to prevent broken displays
- **Service Location**: `/server/services/imageService.ts`

### Show Management
- Three status categories: 'watching', 'planned', 'completed'
- Status transitions with appropriate button actions
- Timestamp tracking for completion dates
- Platform-specific styling with brand colors

### UI Components
- **Tab System**: Instant switching between show categories
- **Show Tiles**: Clean display with poster, title, platform badge, and action button
- **Add Show Dialog**: Simple form with title, platform, and status fields
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Data Flow

### User Authentication Flow
1. User enters username on login page
2. System checks if user exists, creates if new
3. Session established and user redirected to dashboard
4. All subsequent requests include session validation

### Show Management Flow
1. User adds show via dialog form
2. Server validates input and fetches poster image
3. Show saved to database with user association
4. Client updates via React Query cache invalidation
5. UI updates instantly with new show tile

### Image Fetching Process
1. Google Custom Search API attempted first
2. TMDB API used as fallback
3. Default image used if both fail
4. Images cached at database level via imageUrl field

## External Dependencies

### APIs
- **Google Custom Search API**: Primary image source
- **TMDB API**: Fallback image source
- **Neon Database**: Serverless PostgreSQL hosting

### Development Tools
- **Vite**: Development server and build tool
- **Replit Integration**: Development environment optimization
- **TypeScript**: Type safety across full stack

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library

## Deployment Strategy

### Build Process
- **Client Build**: Vite builds React app to `/dist/public`
- **Server Build**: esbuild compiles TypeScript server to `/dist`
- **Production Mode**: Node.js serves built files

### Environment Configuration
- **Database URL**: Required for Drizzle connection
- **API Keys**: Optional for enhanced image fetching
- **Development**: Hot module replacement via Vite
- **Production**: Static file serving with Express

### Database Management
- **Schema Push**: `npm run db:push` applies schema changes
- **Migrations**: Generated in `/migrations` directory
- **Connection**: Serverless connection pooling via Neon

The application is designed for simplicity and reliability, with a focus on core functionality over complex features. The architecture supports easy scaling and maintenance while providing a smooth user experience.