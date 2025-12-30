// Example usage of project authorization and virtual populates

import { Router } from "express";
import {
  getProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers";
import {
  isProjectMember,
  isProjectAdmin,
  isProjectOwner,
} from "../middleware/projectAuth";

const router = Router();

// ============================================================================
// EXAMPLE: How to use authorization middleware
// ============================================================================

/*
// Public route - anyone can view project (if they have the ID)
router.get("/:id", getProjectController);

// Members only - only project members can update
router.put("/:id", isProjectMember, updateProjectController);

// Admins only - only ADMIN or MANAGER can delete
router.delete("/:id", isProjectAdmin, deleteProjectController);

// Owners only - only ADMIN can perform this action
router.post('/:id/archive', isProjectOwner, archiveProjectController);
*/

// ============================================================================
// EXAMPLE: How to use virtual populates
// ============================================================================

/*
// WITHOUT members (default - faster, less data)
const project = await Project.findById(id);
// Returns: { _id, projectName, status, ... }

// WITH members (opt-in when needed)
const projectWithMembers = await Project.findById(id).populate('members');
// Returns: { 
//   _id, 
//   projectName, 
//   status, 
//   members: [
//     { project: '...', user: '...', role: 'ADMIN', ... },
//     { project: '...', user: '...', role: 'MEMBER', ... }
//   ]
// }

// WITH members filtered by role
const projectWithAdmins = await Project.findById(id).populate({
  path: 'members',
  match: { role: { $in: ['ADMIN', 'MANAGER'] } }
});

// WITHOUT virtuals at all (using lean for max performance)
const leanProject = await Project.findById(id).lean();
// Returns plain JS object, no virtuals, no mongoose methods
*/

export default router;
