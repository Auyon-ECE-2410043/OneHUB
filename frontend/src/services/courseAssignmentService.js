import courseService from "./courseService";

export const courseAssignmentService = {
  assignCourses: courseService.assignCoursesToBatch,
};

export default courseAssignmentService;
