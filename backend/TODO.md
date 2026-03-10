# Backend Implementation TODO

## Completed ✅
- [x] Create DTOs (SaleRequestDto, SaleResponseDto, SaleWithDetailsDto, PolicyDto, UserDto)
- [x] Update Sales entity (change saleid from Long to String)
- [x] Create Policy entity and repository
- [x] Update SalesService interface with all required methods
- [x] Implement SalesServiceImpl with business logic migrated from frontend
- [x] Update SalesController with proper endpoints and DTOs
- [x] Update SalesRepository (change ID type to String, add query methods)
- [x] Create PolicyService interface and implementation
- [x] Create PolicyController
- [x] Update UserController endpoints from /user/* to /users

## Remaining Tasks 🔄
- [ ] Create Incentive entity and related components
- [ ] Create Leaderboard entity and related components
- [ ] Update UserService to return UserDto instead of Users entity
- [ ] Add proper error handling and validation
- [ ] Update frontend services to use new backend URLs
- [ ] Test integration between frontend and backend
- [ ] Add database migration scripts for existing data
- [ ] Configure CORS properly for production
- [ ] Add authentication/authorization to endpoints
- [ ] Add input validation and sanitization
- [ ] Add logging and monitoring
- [ ] Performance optimization and caching

## Testing Checklist
- [ ] Backend starts without errors
- [ ] All endpoints return expected responses
- [ ] Frontend can connect to backend
- [ ] CRUD operations work for all entities
- [ ] Business logic migrated correctly
- [ ] Data consistency maintained
- [ ] Error handling works properly

## Notes
- Business logic for sale ID generation moved from frontend to backend
- DTOs used for request/response separation
- Repository pattern implemented for data access
- Service layer contains business logic
- Controller layer handles HTTP requests/responses
