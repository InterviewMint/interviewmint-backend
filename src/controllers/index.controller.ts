import { addNewCollage } from "./collage.controller.js";
import { addNewCompany } from "./company.controller.js";
import { addNewJob, findJob } from "./job.controller.js";
import {
  getUserProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
} from "./user.controller.js";

export {
  // User Controllers
  loginUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
  // Job Controllers
  addNewJob,
  findJob,
  // Collage Controllers
  addNewCollage,
  // Company Controllers
  addNewCompany,
};
