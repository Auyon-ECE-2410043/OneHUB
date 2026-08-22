/**
 * File: courseAssignmentService.js
 * Description: Service layer for making API calls related to courseAssignment.
 * 
 * This file is part of the RUET OneHub Project.
 */

import courseService from "./courseService";

export const courseAssignmentService = {
  assignCourses: courseService.assignCoursesToBatch,
};

export default courseAssignmentService;
