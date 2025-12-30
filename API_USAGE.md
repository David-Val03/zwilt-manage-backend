# Frontend Query Parameter Examples

## Population via Query Parameters

You can now control what gets populated from the frontend using query parameters!

> **Important:** Single project endpoint uses `populate`, but the list endpoint uses `$populate` (PagingQuery convention)

### Get Single Project

#### Without Members (default - faster)

```
GET /api/projects/507f1f77bcf86cd799439011
```

Response:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "projectName": "Ticketing System",
  "status": "ACTIVE",
  "organization": "org123",
  "createdBy": "user456"
}
```

#### With Members (opt-in) - use `populate`

```
GET /api/projects/507f1f77bcf86cd799439011?populate=members
```

Response:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "projectName": "Ticketing System",
  "status": "ACTIVE",
  "organization": "org123",
  "createdBy": "user456",
  "members": [
    {
      "project": "507f1f77bcf86cd799439011",
      "user": "user123",
      "role": "ADMIN",
      "addedAt": "2024-01-01T00:00:00.000Z",
      "addedBy": "user456"
    },
    {
      "project": "507f1f77bcf86cd799439011",
      "user": "user789",
      "role": "MEMBER",
      "addedAt": "2024-01-02T00:00:00.000Z",
      "addedBy": "user123"
    }
  ]
}
```

---

### Get Projects List (Paginated)

> **Note:** List endpoint uses `$populate` (with dollar sign) - this is the PagingQuery convention

#### Without Members (default - faster)

```
GET /api/projects?limit=10&page=1
```

#### With Members - use `$populate`

```
GET /api/projects?limit=10&page=1&$populate=members
```

#### With Sorting and Population

```
GET /api/projects?limit=20&$sort=projectName+asc&$populate=members
```

---

## Parameter Summary

| Endpoint       | Parameter   | Example              |
| -------------- | ----------- | -------------------- |
| Single Project | `populate`  | `?populate=members`  |
| Projects List  | `$populate` | `?$populate=members` |

Why the difference? The list endpoint uses `PagingQuery` which has a convention of prefixing its special parameters with `$` (like `$limit`, `$sort`, `$populate`).

---

## Frontend Usage Examples

### React/TypeScript

#### Single Project Endpoint

```typescript
// Without members
const getProject = async (id: string) => {
  const response = await fetch(`/api/projects/${id}`);
  return response.json();
};

// With members - use 'populate'
const getProjectWithMembers = async (id: string) => {
  const response = await fetch(`/api/projects/${id}?populate=members`);
  return response.json();
};

// Conditional population
const getProject = async (id: string, includeMembers = false) => {
  const url = `/api/projects/${id}${includeMembers ? "?populate=members" : ""}`;
  const response = await fetch(url);
  return response.json();
};
```

#### Projects List Endpoint

```typescript
// Without members
const getProjects = async (page = 1, limit = 20) => {
  const response = await fetch(`/api/projects?page=${page}&limit=${limit}`);
  return response.json();
};

// With members - use '$populate'
const getProjectsWithMembers = async (page = 1, limit = 20) => {
  const response = await fetch(
    `/api/projects?page=${page}&limit=${limit}&$populate=members`
  );
  return response.json();
};
```

### Axios

```typescript
import axios from "axios";

// Single project without members
const project = await axios.get(`/api/projects/${id}`);

// Single project with members - use 'populate'
const projectWithMembers = await axios.get(`/api/projects/${id}`, {
  params: { populate: "members" },
});

// Projects list with pagination and population - use '$populate'
const projects = await axios.get("/api/projects", {
  params: {
    limit: 20,
    page: 1,
    $populate: "members", // Note the $ prefix
    $sort: "createdAt desc",
  },
});
```

### React Query

```typescript
import { useQuery } from "@tanstack/react-query";

// Hook with optional population
const useProject = (id: string, includeMembers = false) => {
  return useQuery({
    queryKey: ["project", id, includeMembers],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (includeMembers) params.append("populate", "members");

      const response = await fetch(`/api/projects/${id}?${params}`);
      return response.json();
    },
  });
};

// Usage
const { data: project } = useProject("123", false); // Without members
const { data: projectWithMembers } = useProject("123", true); // With members
```

---

## Multiple Population (Future Enhancement)

When you add more virtual populates (e.g., `organization`), you can populate multiple fields:

```
GET /api/projects/123?populate=members,organization
```

Currently supported:

- `members` - Project team members

---

## Security

The `applyPopulate` utility only allows whitelisted fields to be populated:

```typescript
// In controller
applyPopulate(query, populate, ["members"]); // Only "members" allowed
```

This prevents users from populating arbitrary fields and protects against:

- Performance issues from populating expensive relationships
- Security issues from exposing sensitive data
- N+1 query problems from nested populations
