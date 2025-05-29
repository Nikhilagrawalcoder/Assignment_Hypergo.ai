# Property Management System - Backend Documentation

## 1. Project Overview

### Project Name
Property Management System

### Brief Description
A comprehensive backend system for managing real estate properties with features for property listings, user management, favorites, recommendations, and user authentication. The system supports property search, filtering, caching, and social features like property recommendations between users.

### Key Features/Modules
- User authentication and authorization with JWT
- Property management (CRUD operations)
- Property search and filtering
- Favorites management
- Property recommendation system
- User profile management
- Redis caching for performance optimization
- Property categorization and tagging

### Tech Stack
- **Language & Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Caching**: Redis
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Environment**: dotenv

## 2. Architecture Diagrams

### System Architecture
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516408/byw89n9f5nxmn9uhe8qs.png)

### Database Schema
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516407/zov1x5vlgn7hz3gzot06.png)

      
### Authentication Flow
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516407/jdx4houjhf5mp0a5mwzb.png)

### Property Management Flow
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516407/hij4vcttsoisqax5q9jh.png)

## 3. System Components/Modules

### Authentication Module
- **Responsibilities**: User registration, login, token management
- **APIs exposed**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Services it depends on**: JWT, bcrypt
- **Main files**: `auth.js`, `middleware/auth.js`

### Property Management Module
- **Responsibilities**: CRUD operations for properties, search, filtering
- **APIs exposed**: `/api/properties/*`
- **Services it depends on**: Redis Cache, MongoDB
- **Main files**: `properties.js`, `models/Property.js`

### User Management Module
- **Responsibilities**: User profile management
- **APIs exposed**: `/api/users/profile`
- **Services it depends on**: Authentication middleware
- **Main files**: `users.js`, `models/User.js`

### Favorites Module
- **Responsibilities**: Managing user favorite properties
- **APIs exposed**: `/api/favorites/*`
- **Services it depends on**: Authentication middleware
- **Main files**: `favorites.js`, `models/Favorite.js`

### Recommendations Module
- **Responsibilities**: Property recommendations between users
- **APIs exposed**: `/api/recommendations/*`
- **Services it depends on**: User search, authentication
- **Main files**: `recommendations.js`, `models/Recommendation.js`

### Caching Module
- **Responsibilities**: Redis-based caching for performance
- **APIs exposed**: Internal utility functions
- **Services it depends on**: Redis
- **Main files**: `utils/cache.js`

## 4. API Documentation

### Authentication Routes

#### `POST /api/auth/register`
- **Description**: Register a new user
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```
- **Response**:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
- **Status Codes**: 201, 400, 500

#### `POST /api/auth/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Response**:
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
- **Status Codes**: 200, 401, 500

#### `GET /api/auth/me`
- **Description**: Get current authenticated user
- **Authorization**: Required
- **Response**:
```json
{
  "user": {
    "id": "60d21b4667d0d8992e610c85",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```
- **Status Codes**: 200, 401, 500

### Property Routes

#### `GET /api/properties`
- **Description**: Get properties with filtering and pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `type`: Property type filter
  - `city`: City filter
  - `state`: State filter
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `bedrooms`: Number of bedrooms
  - `bathrooms`: Number of bathrooms
  - `furnished`: Furnished status
  - `listingType`: "rent" or "sale"
  - `amenities`: Comma-separated amenities
  - `tags`: Comma-separated tags
  - `sortBy`: Sort field (default: "createdAt")
  - `sortOrder`: "asc" or "desc" (default: "desc")
- **Response**:
```json
{
  "properties": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```
- **Status Codes**: 200, 500

#### `GET /api/properties/:id`
- **Description**: Get single property by ID
- **Response**:
```json
{
  "id": "PROP1234567890",
  "title": "Luxury Apartment",
  "type": "Apartment",
  "price": 50000,
  "state": "California",
  "city": "San Francisco",
  "areaSqFt": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["Parking", "Gym"],
  "furnished": "Furnished",
  "availableFrom": "2024-01-01",
  "listedBy": "Owner",
  "tags": ["Luxury", "Downtown"],
  "colorTheme": "blue",
  "rating": 4.5,
  "isVerified": true,
  "listingType": "rent",
  "createdBy": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```
- **Status Codes**: 200, 404, 500

#### `POST /api/properties`
- **Description**: Create a new property
- **Authorization**: Required
- **Request Body**:
```json
{
  "title": "Luxury Apartment",
  "type": "Apartment",
  "price": 50000,
  "state": "California",
  "city": "San Francisco",
  "areaSqFt": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "amenities": ["Parking", "Gym"],
  "furnished": "Furnished",
  "availableFrom": "2024-01-01",
  "listedBy": "Owner",
  "tags": ["Luxury", "Downtown"],
  "colorTheme": "blue",
  "listingType": "rent"
}
```
- **Response**:
```json
{
  "message": "Property created successfully",
  "property": {
    "id": "PROP1234567890",
    "title": "Luxury Apartment",
    ...
  }
}
```
- **Status Codes**: 201, 400, 401, 500

#### `PUT /api/properties/:id`
- **Description**: Update property (owner only)
- **Authorization**: Required (property owner)
- **Status Codes**: 200, 400, 401, 403, 404, 500

#### `DELETE /api/properties/:id`
- **Description**: Delete property (soft delete - sets isActive to false)
- **Authorization**: Required (property owner)
- **Status Codes**: 200, 401, 403, 404, 500

#### `GET /api/properties/search/text`
- **Description**: Text search properties
- **Query Parameters**:
  - `q`: Search query (required)
  - `limit`: Result limit (default: 10)
- **Response**:
```json
[
  {
    "id": "PROP1234567890",
    "title": "Luxury Apartment",
    ...
  }
]
```
- **Status Codes**: 200, 400, 500

### Favorites Routes

#### `GET /api/favorites`
- **Description**: Get user's favorite properties
- **Authorization**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
```json
{
  "favorites": [
    {
      "property": {
        "id": "PROP1234567890",
        "title": "Luxury Apartment",
        ...
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```
- **Status Codes**: 200, 401, 500

#### `POST /api/favorites/:propertyId`
- **Description**: Add property to favorites
- **Authorization**: Required
- **Response**:
```json
{
  "message": "Added to favorites",
  "favorite": {
    "property": {
      "id": "PROP1234567890",
      "title": "Luxury Apartment"
    }
  }
}
```
- **Status Codes**: 201, 400, 401, 404, 500

#### `DELETE /api/favorites/:propertyId`
- **Description**: Remove property from favorites
- **Authorization**: Required
- **Response**:
```json
{
  "message": "Removed from favorites"
}
```
- **Status Codes**: 200, 401, 404, 500

### Recommendations Routes

#### `GET /api/recommendations/received`
- **Description**: Get recommendations received by user
- **Authorization**: Required
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
```json
{
  "recommendations": [
    {
      "from": {
        "name": "Jane Doe",
        "email": "jane@example.com"
      },
      "property": {
        "id": "PROP1234567890",
        "title": "Luxury Apartment"
      },
      "message": "This might interest you!",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```
- **Status Codes**: 200, 401, 500

#### `GET /api/recommendations/sent`
- **Description**: Get recommendations sent by user
- **Authorization**: Required
- **Status Codes**: 200, 401, 500

#### `POST /api/recommendations`
- **Description**: Send a property recommendation
- **Authorization**: Required
- **Request Body**:
```json
{
  "email": "friend@example.com",
  "propertyId": "PROP1234567890",
  "message": "Check out this amazing property!"
}
```
- **Response**:
```json
{
  "message": "Recommendation sent successfully",
  "recommendation": {
    "from": "...",
    "to": "...",
    "property": "...",
    "message": "Check out this amazing property!"
  }
}
```
- **Status Codes**: 201, 400, 401, 404, 500

#### `PATCH /api/recommendations/:id/read`
- **Description**: Mark recommendation as read
- **Authorization**: Required
- **Response**:
```json
{
  "message": "Recommendation marked as read",
  "recommendation": {
    "isRead": true,
    ...
  }
}
```
- **Status Codes**: 200, 401, 404, 500

#### `GET /api/recommendations/users/search`
- **Description**: Search users by email for recommendations
- **Authorization**: Required
- **Query Parameters**:
  - `email`: Email to search for
- **Response**:
```json
[
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
]
```
- **Status Codes**: 200, 400, 401, 500

### User Routes

#### `GET /api/users/profile`
- **Description**: Get user profile
- **Authorization**: Required
- **Response**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```
- **Status Codes**: 200, 401, 500

#### `PUT /api/users/profile`
- **Description**: Update user profile
- **Authorization**: Required
- **Request Body**:
```json
{
  "name": "John Smith",
  "role": "agent"
}
```
- **Response**:
```json
{
  "message": "Profile updated successfully",
  "user": {
    "name": "John Smith",
    "email": "john@example.com",
    "role": "agent"
  }
}
```
- **Status Codes**: 200, 401, 500

## 5. Database Design

### Entity Relationship Diagram
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516407/gw6ja3ynhcx5fwrvhbiy.png)
### Main Collections

#### User
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String, required
  - `email`: String, required, unique, lowercase
  - `password`: String, required, hashed with bcrypt
  - `role`: String, enum ['user', 'agent', 'builder', 'admin'], default: 'user'
  - `isActive`: Boolean, default: true
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
- **Indexes**: email (unique)
- **Methods**: `comparePassword()` for password verification

#### Property
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `id`: String, required, unique (auto-generated: PROP + timestamp)
  - `title`: String, required
  - `type`: String, required, enum ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse']
  - `price`: Number, required, min: 0
  - `state`: String, required
  - `city`: String, required
  - `areaSqFt`: Number, required, min: 0
  - `bedrooms`: Number, required, min: 0
  - `bathrooms`: Number, required, min: 0
  - `amenities`: Array of Strings
  - `furnished`: String, required, enum ['Furnished', 'Semi', 'Unfurnished']
  - `availableFrom`: Date, required
  - `listedBy`: String, required, enum ['Owner', 'Agent', 'Builder']
  - `tags`: Array of Strings
  - `colorTheme`: String, required
  - `rating`: Number, min: 0, max: 5
  - `isVerified`: Boolean, default: false
  - `listingType`: String, required, enum ['rent', 'sale']
  - `createdBy`: ObjectId, ref: 'User', required
  - `isActive`: Boolean, default: true
- **Indexes**: 
  - city + type (compound)
  - price
  - listingType
  - createdBy
  - tags

#### Favorite
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `user`: ObjectId, ref: 'User', required
  - `property`: ObjectId, ref: 'Property', required
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
- **Indexes**: user + property (compound, unique)

#### Recommendation
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `from`: ObjectId, ref: 'User', required
  - `to`: ObjectId, ref: 'User', required
  - `property`: ObjectId, ref: 'Property', required
  - `message`: String, maxlength: 500
  - `isRead`: Boolean, default: false
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
- **Indexes**: to + isRead (compound)

## 6. Authentication & Authorization

### Authentication Method
- **JWT (JSON Web Tokens)** for stateless authentication
- Password hashing using **bcrypt** with salt rounds of 12
- Token expiry: 7 days (configurable)

### Authorization Model
- **Role-based access control** with four user roles:
  - `user`: Basic user with property viewing and interaction rights
  - `agent`: Real estate agent with property management rights
  - `builder`: Builder with enhanced property creation rights
  - `admin`: System administrator with full access

### Middleware Flow
1. **Authentication Middleware**: Validates JWT token and attaches user to request
2. **Authorization Check**: Verifies user permissions based on role and resource ownership
3. **Request Processing**: Processes authenticated and authorized requests

## 7. Error Handling

### Error Structure
```json
{
  "message": "Error description",
  "error": "Detailed error message (development only)",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    }
  ]
}
```

### Error Types
- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

### Validation
- **express-validator** for request validation
- Custom validation messages for user-friendly error responses
- Centralized error handling middleware

## 8. Caching Strategy

### Redis Implementation
- **Property Listings**: Cached for 5 minutes (300 seconds)
- **Individual Properties**: Cached for 10 minutes (600 seconds)
- **Search Results**: Cached for 5 minutes (300 seconds)

### Cache Keys
- `properties:{query_hash}`: Property listings with filters
- `property:{id}`: Individual property data
- `search:{query}:{limit}`: Search results

### Cache Invalidation
- Cache cleared on property create/update/delete operations
- Wildcard pattern deletion for related cache entries

## 9. Security Features

### Security Middleware
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Request size limiting**: 10MB JSON payload limit

### Data Security
- Password hashing with bcrypt
- JWT token-based authentication
- User input validation and sanitization
- Soft delete for data retention

## 10. Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB
- Redis (optional, for caching)

### Environment Variables
Create a `.env` file:
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/property-management

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Installation Steps
1. **Clone the repository**
```bash
git clone <repository-url>
cd property-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the server**
```bash
npm start
```

The server will start on `http://localhost:3000`

### Development
```bash
npm run dev  # If nodemon script is available
```

## 11. Testing

### Manual Testing
- Use Postman collection (provided separately)
- Test all endpoints with various scenarios
- Verify authentication and authorization

### API Health Check
```bash
GET /health
```
Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00Z",
  "uptime": 3600
}
```

## 12. Production Considerations

### Performance Optimization
- Database indexing for frequently queried fields
- Redis caching for expensive operations
- Pagination for large result sets
- Connection pooling for MongoDB

### Security Hardening
- Environment-specific JWT secrets
- HTTPS enforcement
- Rate limiting per user/IP
- Input sanitization
- SQL injection prevention (NoSQL injection)

### Monitoring
- Server uptime monitoring
- Database performance monitoring
- Cache hit/miss ratios
- Error logging and alerting

### Scalability
- Horizontal scaling support
- Database replica sets
- Load balancing
- Microservices architecture (future consideration)

## 13. Future Enhancements

### Planned Features
- Image upload for properties
- Advanced search with geolocation
- Real-time notifications
- Payment integration
- Property viewing appointments
- Reviews and ratings system
- Email notifications
- Mobile API optimization

### Technical Improvements
- GraphQL API
- Microservices architecture
- Event-driven architecture
- Advanced caching strategies
- Performance monitoring
- Unit and integration testing
- CI/CD pipeline

## 14. Support



### Contact
For technical support or questions, please refer to the project repository or contact the development team.

---

**Note**: This documentation is for the backend API. Frontend applications should implement proper error handling and user experience flows when consuming these APIs.