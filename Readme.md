# Property Management System - Backend Documentation

## 1. Project Overview

### Project Name
Property Management System

### Brief Description
A comprehensive backend system for managing real estate properties with features for property listings, user management, favorites, recommendations, and user authentication. The system supports property search, filtering, caching, and social features like property recommendations between users.

### API POSTMAN Collection
[Postman Collection](https://www.postman.com/nikhil0605/demo/collection/hddcca8/real-estate-api?action=share&creator=29945969)

### Key Features/Modules
- User authentication and authorization with JWT
- Property management (CRUD operations)
- Property search and filtering with text search
- Favorites management
- Property recommendation system between users
- User profile management
- Caching system for performance optimization
- Property categorization and tagging
- Data import from CSV files
- Rate limiting and security middleware

### Tech Stack
- **Language & Framework**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **Caching**: Redis (optional)
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit
- **Environment**: dotenv
- **CSV Processing**: csv-parser for data import
- **HTTP Client**: axios for external API calls

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
- **Responsibilities**: User registration, login, token management, password hashing
- **APIs exposed**: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **Services it depends on**: JWT, bcryptjs
- **Main files**: `routes/auth.js`, `middleware/auth.js`, `models/User.js`

### Property Management Module
- **Responsibilities**: CRUD operations for properties, search, filtering, text search
- **APIs exposed**: `/api/properties/*`
- **Services it depends on**: Cache utility, MongoDB, Authentication middleware
- **Main files**: `routes/properties.js`, `models/Property.js`

### User Management Module
- **Responsibilities**: User profile management, profile updates
- **APIs exposed**: `/api/users/profile`
- **Services it depends on**: Authentication middleware
- **Main files**: `routes/users.js`, `models/User.js`

### Favorites Module
- **Responsibilities**: Managing user favorite properties with pagination
- **APIs exposed**: `/api/favorites/*`
- **Services it depends on**: Authentication middleware, Property model
- **Main files**: `routes/favorites.js`, `models/Favorite.js`

### Recommendations Module
- **Responsibilities**: Property recommendations between users, user search functionality
- **APIs exposed**: `/api/recommendations/*`
- **Services it depends on**: User search, authentication, email-based user lookup
- **Main files**: `routes/recommendations.js`, `models/Recommendation.js`

### Data Import Module
- **Responsibilities**: CSV data import from external sources
- **APIs exposed**: Internal script (not HTTP endpoint)
- **Services it depends on**: axios, csv-parser, MongoDB
- **Main files**: `scripts/importData.js`

### Caching Module
- **Responsibilities**: Redis-based caching for performance optimization
- **APIs exposed**: Internal utility functions
- **Services it depends on**: Redis
- **Main files**: `utils/cache.js`

## 4. API Documentation

### Authentication Routes

#### `POST /api/auth/register`
- **Description**: Register a new user with role-based access
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```
- **Validation Rules**:
  - Name: Required
  - Email: Valid email format required
  - Password: Minimum 6 characters required
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
- **Status Codes**: 201 (Created), 400 (Validation Error/User Exists), 500 (Server Error)

#### `POST /api/auth/login`
- **Description**: Authenticate user and get JWT token (7-day expiry)
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- **Validation Rules**:
  - Email: Valid email format required
  - Password: Required
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
- **Status Codes**: 200 (Success), 401 (Invalid Credentials), 500 (Server Error)

#### `GET /api/auth/me`
- **Description**: Get current authenticated user information
- **Authorization**: Required (JWT Bearer token)
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
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

### Property Routes

#### `GET /api/properties`
- **Description**: Get properties with advanced filtering, sorting, and pagination
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `type`: Property type filter (Apartment, Villa, Bungalow, Studio, Penthouse)
  - `city`: City filter (case-insensitive regex)
  - `state`: State filter (case-insensitive regex)
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `bedrooms`: Number of bedrooms (exact match)
  - `bathrooms`: Number of bathrooms (exact match)
  - `furnished`: Furnished status (Furnished, Semi, Unfurnished)
  - `listingType`: "rent" or "sale"
  - `amenities`: Comma-separated amenities (matches any)
  - `tags`: Comma-separated tags (matches any)
  - `listedBy`: Listed by filter (Owner, Agent, Builder)
  - `sortBy`: Sort field (default: "createdAt")
  - `sortOrder`: "asc" or "desc" (default: "desc")
- **Caching**: Results cached for 5 minutes (300 seconds)
- **Response**:
```json
{
  "properties": [
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
      "availableFrom": "2024-01-01T00:00:00.000Z",
      "listedBy": "Owner",
      "tags": ["Luxury", "Downtown"],
      "colorTheme": "blue",
      "rating": 4.5,
      "isVerified": true,
      "listingType": "rent",
      "createdBy": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```
- **Status Codes**: 200 (Success), 500 (Server Error)

#### `GET /api/properties/:id`
- **Description**: Get single property by MongoDB ObjectId or custom ID
- **Caching**: Property cached for 10 minutes (600 seconds)
- **Response**: Same as individual property object above
- **Status Codes**: 200 (Success), 404 (Not Found), 500 (Server Error)

#### `POST /api/properties`
- **Description**: Create a new property (authenticated users only)
- **Authorization**: Required (JWT Bearer token)
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
- **Validation Rules**:
  - All required fields must be present
  - Enum fields must match allowed values
  - Numeric fields must be valid numbers
  - Date fields must be valid ISO dates
- **Auto-generated**: 
  - `id`: "PROP" + timestamp
  - `createdBy`: Current authenticated user
- **Cache Invalidation**: Clears property listing cache
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
- **Status Codes**: 201 (Created), 400 (Validation Error), 401 (Unauthorized), 500 (Server Error)

#### `PUT /api/properties/:id`
- **Description**: Update property (owner only)
- **Authorization**: Required (must be property owner)
- **Cache Invalidation**: Clears specific property and listing cache
- **Status Codes**: 200 (Success), 400 (Validation Error), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

#### `DELETE /api/properties/:id`
- **Description**: Soft delete property (sets isActive to false, owner only)
- **Authorization**: Required (must be property owner)
- **Cache Invalidation**: Clears specific property and listing cache
- **Status Codes**: 200 (Success), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 500 (Server Error)

#### `GET /api/properties/search/text`
- **Description**: Text search across multiple property fields
- **Query Parameters**:
  - `q`: Search query (required) - searches title, city, state, type, tags, amenities
  - `limit`: Result limit (default: 10)
- **Caching**: Search results cached for 5 minutes (300 seconds)
- **Response**: Array of matching properties
- **Status Codes**: 200 (Success), 400 (Missing Query), 500 (Server Error)

### Favorites Routes

#### `GET /api/favorites`
- **Description**: Get user's favorite properties with pagination
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
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
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
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

#### `POST /api/favorites/:propertyId`
- **Description**: Add property to favorites (supports both ObjectId and custom ID)
- **Authorization**: Required
- **Duplicate Prevention**: Prevents adding same property twice
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
- **Status Codes**: 201 (Created), 400 (Already Exists), 401 (Unauthorized), 404 (Property Not Found), 500 (Server Error)

#### `DELETE /api/favorites/:propertyId`
- **Description**: Remove property from favorites
- **Authorization**: Required
- **Response**:
```json
{
  "message": "Removed from favorites"
}
```
- **Status Codes**: 200 (Success), 401 (Unauthorized), 404 (Favorite Not Found), 500 (Server Error)

### Recommendations Routes

#### `GET /api/recommendations/received`
- **Description**: Get recommendations received by user with pagination
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
        "title": "Luxury Apartment",
        "createdBy": {
          "name": "Owner Name",
          "email": "owner@example.com"
        }
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
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

#### `GET /api/recommendations/sent`
- **Description**: Get recommendations sent by user with pagination
- **Authorization**: Required
- **Query Parameters**: Same as received recommendations
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

#### `POST /api/recommendations`
- **Description**: Send a property recommendation to another user by email
- **Authorization**: Required
- **Request Body**:
```json
{
  "email": "friend@example.com",
  "propertyId": "PROP1234567890",
  "message": "Check out this amazing property!"
}
```
- **Validation Rules**:
  - Email: Valid email format required
  - PropertyId: Required
  - Message: Optional, max 500 characters
- **Business Logic**:
  - Cannot recommend to yourself
  - Prevents duplicate recommendations
  - User must exist and be active
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
- **Status Codes**: 201 (Created), 400 (Validation/Business Rule Error), 401 (Unauthorized), 404 (User/Property Not Found), 500 (Server Error)

#### `PATCH /api/recommendations/:id/read`
- **Description**: Mark recommendation as read (recipient only)
- **Authorization**: Required (must be recommendation recipient)
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
- **Status Codes**: 200 (Success), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)

#### `GET /api/recommendations/users/search`
- **Description**: Search users by email for sending recommendations
- **Authorization**: Required
- **Query Parameters**:
  - `email`: Email to search for (required, case-insensitive)
- **Response**:
```json
[
  {
    "name": "Jane Doe",
    "email": "jane@example.com"
  }
]
```
- **Exclusion**: Current user excluded from results
- **Limit**: Maximum 10 results
- **Status Codes**: 200 (Success), 400 (Missing Email), 401 (Unauthorized), 500 (Server Error)

### User Routes

#### `GET /api/users/profile`
- **Description**: Get user profile (excluding password)
- **Authorization**: Required
- **Response**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

#### `PUT /api/users/profile`
- **Description**: Update user profile (name and role only)
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
- **Status Codes**: 200 (Success), 401 (Unauthorized), 500 (Server Error)

### System Routes

#### `GET /health`
- **Description**: Health check endpoint
- **Authorization**: Not required
- **Response**:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```
- **Status Codes**: 200 (Success)

## 5. Database Design

### Entity Relationship Diagram
![alt text](https://res.cloudinary.com/deccc2bj1/image/upload/v1748516407/gw6ja3ynhcx5fwrvhbiy.png)

### Main Collections

#### User
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `name`: String, required, trimmed
  - `email`: String, required, unique, lowercase, trimmed
  - `password`: String, required, min 6 characters, hashed with bcrypt (12 rounds)
  - `role`: String, enum ['user', 'agent', 'builder', 'admin'], default: 'user'
  - `isActive`: Boolean, default: true
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
- **Indexes**: email (unique)
- **Methods**: 
  - `comparePassword(candidatePassword)`: Compares plain text with hashed password
- **Middleware**: Pre-save hook for password hashing

#### Property
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `id`: String, required, unique (format: "PROP" + timestamp)
  - `title`: String, required, trimmed
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
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
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
- **Population**: Property with nested createdBy user data

#### Recommendation
- **Fields**:
  - `_id`: ObjectId (Primary Key)
  - `from`: ObjectId, ref: 'User', required
  - `to`: ObjectId, ref: 'User', required
  - `property`: ObjectId, ref: 'Property', required
  - `message`: String, maxlength: 500, optional
  - `isRead`: Boolean, default: false
  - `createdAt`: Date, auto-generated
  - `updatedAt`: Date, auto-generated
- **Indexes**: to + isRead (compound)

## 6. Authentication & Authorization

### Authentication Method
- **JWT (JSON Web Tokens)** for stateless authentication
- Password hashing using **bcryptjs** with salt rounds of 12
- Token expiry: 7 days (configurable via JWT_SECRET)
- Token format: Bearer token in Authorization header

### Authorization Model
- **Role-based access control** with four user roles:
  - `user`: Basic user with property viewing and interaction rights
  - `agent`: Real estate agent with property management rights
  - `builder`: Builder with enhanced property creation rights
  - `admin`: System administrator with full access
- **Resource ownership**: Users can only modify their own properties
- **Active user check**: Only active users can authenticate

### Middleware Implementation
- **Authentication Middleware** (`middleware/auth.js`):
  - Validates JWT token from Authorization header
  - Attaches user object to request
  - Returns 401 for invalid/missing tokens
- **Route Protection**: Applied to all routes requiring authentication

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
- **Validation Errors**: 400 Bad Request (express-validator)
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Conflict Errors**: 400 Bad Request (duplicate entries)
- **Server Errors**: 500 Internal Server Error

### Global Error Handler
- Centralized error handling middleware in `server.js`
- Environment-specific error details (production vs development)
- Proper HTTP status codes for different error types

## 8. Caching Strategy

### Cache Implementation
- **Conditional Redis caching** (requires cache utility setup)
- **Memory-based fallback** when Redis unavailable

### Cache Keys and TTL
- **Property Listings**: `properties:{query_hash}` - 5 minutes (300 seconds)
- **Individual Properties**: `property:{id}` - 10 minutes (600 seconds)
- **Search Results**: `search:{query}:{limit}` - 5 minutes (300 seconds)

### Cache Invalidation Strategy
- **Create Operations**: Clear `properties:*` wildcard
- **Update Operations**: Clear specific property and property listings
- **Delete Operations**: Clear specific property and property listings
- **Wildcard Deletion**: Supports pattern-based cache clearing

### Cache Utility Functions
- `getCache(key)`: Retrieve cached data
- `setCache(key, data, ttl)`: Store data with expiration
- `deleteCache(pattern)`: Delete specific or pattern-matched keys

## 9. Security Features

### Security Middleware Stack
- **Helmet**: Security headers (XSS protection, content type sniffing prevention)
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: 100 requests per 15 minutes per IP address
- **Request size limiting**: 10MB JSON payload limit
- **URL encoding**: Extended URL encoding support

### Data Security Measures
- **Password Security**: bcryptjs with salt rounds of 12
- **JWT Security**: Secret-based token signing
- **Input Validation**: express-validator for all user inputs
- **Data Sanitization**: Trimming and case normalization
- **Soft Delete**: Preserves data integrity (isActive flag)

### Security Best Practices
- No password fields in API responses
- Token-based stateless authentication
- Environment variable protection for secrets
- SQL injection prevention (NoSQL with Mongoose)

## 10. Data Import System

### CSV Import Functionality
- **External Data Source**: Downloads CSV from CDN URL
- **Processing**: Parses CSV with automatic data type conversion
- **Data Transformation**: 
  - Splits pipe-delimited arrays (amenities, tags)
  - Converts string dates to Date objects
  - Parses numeric values
  - Maps boolean strings to boolean values

### Import Process
1. **MongoDB Connection**: Establishes database connection
2. **Default User Creation**: Creates system admin if not exists
3. **CSV Download**: Fetches data from external URL using axios
4. **Data Processing**: Parses and transforms CSV data
5. **Database Update**: Clears existing data and inserts new records
6. **Cleanup**: Removes temporary files

### Import Script Usage
```bash
node scripts/importData.js
```

## 11. Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (v4.0 or higher)
- **Redis** (optional, for caching)

### Environment Variables
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/property-management

# Authentication
JWT_SECRET=your-super-secret-jwt-key-here

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### Installation Steps

1. **Clone and Setup**
```bash
git clone <repository-url>
cd property-management-system
npm install
```

2. **Database Setup**
```bash
# Start MongoDB service
# For Windows: net start MongoDB
# For macOS: brew services start mongodb-community
# For Linux: sudo systemctl start mongod
```

3. **Import Sample Data (Optional)**
```bash
node scripts/importData.js
```

4. **Start the Server**
```bash
npm start
```

The server will start on `http://localhost:3000`

### Development Mode
```bash
npm run dev  # If using nodemon for auto-restart
```

### Verification
Test the health endpoint:
```bash
curl http://localhost:3000/health
```

## 12. Testing Guide

### Manual Testing with Postman
1. **Import Collection**: Use the provided Postman collection
2. **Environment Setup**: Configure base URL and authentication tokens
3. **Test Scenarios**:
   - User registration and login
   - Property CRUD operations
   - Search and filtering
   - Favorites management
   - Recommendations workflow

### API Health Check
```bash
GET /health
```
Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600
}
```

### Testing Authentication Flow
1. Register a new user
2. Login to get JWT token
3. Use token in Authorization header for protected routes
4. Test token expiration (7 days)

## 13. Performance Optimization

### Database Optimization
- **Strategic Indexing**: 
  - Compound indexes for common query patterns
  - Single field indexes for sorting and filtering
  - Unique indexes for data integrity
- **Query Optimization**: Efficient MongoDB queries with proper field selection
- **Pagination**: Implements skip/limit for large datasets

### Caching Strategy
- **Multi-level Caching**: Property listings, individual properties, search results
- **Cache-aside Pattern**: Check cache first, populate on miss
- **Intelligent Invalidation**: Targeted cache clearing on data changes

### Application Performance
- **Connection Pooling**: MongoDB connection reuse
- **Request Validation**: Early validation to prevent unnecessary processing
- **Response Optimization**: Selective field population and trimming

## 14. Production Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure secure JWT_SECRET
- [ ] Set up MongoDB replica set
- [ ] Configure Redis cluster
- [ ] Enable HTTPS/SSL
- [ ] Set up reverse proxy (nginx)
- [ ] Configure monitoring and logging
- [ ] Set up backup strategies

### Environment Configuration
```env
# Production Environment
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://replica-set-url/property-management
JWT_SECRET=production-secret-key-very-secure
REDIS_URL=redis://redis-cluster-url:6379
```

### Security Hardening
- Rate limiting per authenticated user
- IP whitelisting for admin operations
- Database connection encryption
- Regular security updates

## 15. Monitoring and Maintenance

### Health Monitoring
- **Application Health**: `/health` endpoint monitoring
- **Database Health**: Connection status and query performance
- **Cache Health**: Redis availability and hit rates
- **Server Metrics**: CPU, memory, disk usage

### Log Management
- Structured logging for debugging
- Error tracking and alerting
- Performance monitoring
- User activity analytics

### Backup Strategy
- Regular MongoDB backups
- Point-in-time recovery capability
- Configuration backup
- Disaster recovery procedures

## 16. API Rate Limiting

### Current Limits
- **Global Limit**: 100 requests per 15 minutes per IP address
- **Window**: Rolling 15-minute window
- **Response**: 429 Too Many Requests when exceeded

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 17. Future Enhancements

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

## 15. Support

### Contact
For technical support or questions, please refer to the project repository or contact the development team.

---

**Note**: This documentation is for the backend API. Frontend applications should implement proper error handling and user experience flows when consuming these APIs.