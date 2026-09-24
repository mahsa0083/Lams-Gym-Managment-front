// // src/services/TrainerService.ts

// import ApiService from "@/services/client/ApiService";

// import type {
//   CreateTrainerRequest,
//   TrainerCourseResponse,
//   TrainerDetailResponse,
//   TrainerListItemResponse,
//   UpdateTrainerRequest,
// } from "@/@types/trainer";

// const TRAINERS_ENDPOINT = "/trainers";

// export const TrainerService = {
//   getAll() {
//     return ApiService.get<TrainerListItemResponse[]>(
//       TRAINERS_ENDPOINT
//     );
//   },

//   getById(id: number) {
//     return ApiService.get<TrainerDetailResponse>(
//       `${TRAINERS_ENDPOINT}/${id}`
//     );
//   },

//   create(data: CreateTrainerRequest) {
//     return ApiService.post<boolean, CreateTrainerRequest>(
//       TRAINERS_ENDPOINT,
//       data
//     );
//   },

//   update(id: number, data: UpdateTrainerRequest) {
//     return ApiService.put<void, UpdateTrainerRequest>(
//       `${TRAINERS_ENDPOINT}/${id}`,
//       data
//     );
//   },

//   remove(id: number) {
//     return ApiService.delete<void>(
//       `${TRAINERS_ENDPOINT}/${id}`
//     );
//   },

//   getCourses(id: number) {
//     return ApiService.get<TrainerCourseResponse[]>(
//       `${TRAINERS_ENDPOINT}/${id}/courses`
//     );
//   },
// };
