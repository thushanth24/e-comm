# StyleStore - Full-Stack E-commerce Catalog

StyleStore is a full-stack e-commerce catalog web application for a clothing store built with Next.js, Supabase, and AWS S3.

## Features

### Public Website
- Browse products by category (Men, Women, Kids, Accessories)
- View featured products and new arrivals
- Detailed product pages with image galleries
- Filter products by category and price range
- Search functionality
- Responsive design with dark/light mode toggle

### Admin Dashboard
- Full CRUD operations for products and categories
- Image upload for products using AWS S3
- Form validation with real-time feedback

## Technology Stack

- **Frontend & Backend**: Next.js 13+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Supabase
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Image Storage**: AWS S3
- **Testing**: Jest, React Testing Library, Supertest

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL
- AWS account with S3 bucket

### Environment Setup

1. Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local


admin@example.com
admin123