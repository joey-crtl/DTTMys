const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // ---------------- Window Controls ----------------
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),

  // ---------------- Login ----------------
  login: (username, password) => ipcRenderer.invoke("login", { username, password }),

  // ---------------- Admin Registration ----------------
  createAdmin: (data) => ipcRenderer.invoke("createAdmin", data),

  // ---------------- Packages ----------------
  getPackages: () => ipcRenderer.invoke("getPackages"),
  addPackage: pkg => ipcRenderer.invoke("addPackage", pkg),
  editPackage: pkg => ipcRenderer.invoke("editPackage", pkg),
  deletePackage: id => ipcRenderer.invoke("deletePackage", id),
  uploadPackagePhoto: (fileBase64, fileName) =>
    ipcRenderer.invoke("uploadPackagePhoto", { fileBase64, fileName }),
  updatePackage: (pkg) => ipcRenderer.invoke("updatePackage", pkg),

  // ---------------- Local Packages ----------------
  getLocalPackages: () => ipcRenderer.invoke("getLocalPackages"),
  addLocalPackage: pkg => ipcRenderer.invoke("addLocalPackage", pkg),
  editLocalPackage: pkg => ipcRenderer.invoke("editLocalPackage", pkg),
  deleteLocalPackage: id => ipcRenderer.invoke("deleteLocalPackage", id),
  updateLocalPackage: (pkg) => ipcRenderer.invoke("updateLocalPackage", pkg),


  // ---------------- Bookings ----------------
  getBookings: () => ipcRenderer.invoke("getBookings"),
  updateBookingStatus: ({ id, status }) =>
    ipcRenderer.invoke("updateBookingStatus", { id, status }),
  updateAvailableSeats: ({ packageId, passengers, table }) =>
  ipcRenderer.invoke("updateAvailableSeats", { packageId, passengers, table }),

  // ---------------- Dashboard ----------------
  getDashboardStats: () => ipcRenderer.invoke("getDashboardStats"),
  getFirebaseActiveUsers: () => ipcRenderer.invoke("getFirebaseActiveUsers"),


  // ---------------- Schedule ----------------
  getSchedules: () => ipcRenderer.invoke("getSchedules"),
  createSchedule: (data) => ipcRenderer.invoke("createSchedule", data),
  updateBookingDate: (data) => ipcRenderer.invoke("updateBookingDate", data),

  // ---------------- Feedbacks ----------------
  getFeedbacks: () => ipcRenderer.invoke("getFeedbacks"),
});
  