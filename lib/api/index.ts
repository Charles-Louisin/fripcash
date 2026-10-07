/**
 * Nest API client (FripCash-API fe-integration guides).
 * Base URL must include /api/v1 (deployed gateway).
 * Relative paths: Auth /auth/* · Product /* · Health /health
 */

export { ApiError, type ApiErrorBody, type AuthErrorBody } from "./errors";
export {
  api,
  readToken,
  writeToken,
  clearToken,
  setToken,
  removeToken,
  getToken,
  TOKEN_COOKIE,
} from "./client";

export {
  sendOtp,
  verifyOtp,
  signOut,
  getSession,
  adminLogin,
  courierLogin,
  adminSignInEmail,
  signInEmail,
  signUpEmail,
  sendVerificationEmail,
  verifyEmail,
  verifyEmailCode,
  requestPasswordReset,
  resetPassword,
  type AuthUser,
  type VerifyOtpResponse,
} from "./auth";

export { fetchMe, updateMe, type Me } from "./me";

export {
  fetchCategories,
  fetchZones,
  fetchTariffs,
  fetchShops,
  fetchPublicStats,
  fetchPublicSettings,
  createCategory,
  updateCategory,
  deleteCategory,
  createZone,
  updateZone,
  deleteZone,
  type CatalogCategory,
  type CatalogZone,
  type CatalogTariff,
  type PublicShop,
  type ListingDestination,
} from "./catalog";

export {
  fetchListings,
  fetchListing,
  createListing,
  updateListing,
  deleteListing,
  listingImageUrl,
  attachListingMedia,
  replaceListingMedia,
  deleteListingMedia,
  fetchListingComments,
  createListingComment,
  fetchListingReviews,
  fetchSellerReviews,
  createOrderReview,
  type Listing,
  type ListingMedia,
  type ListingStatus,
} from "./listings";

export {
  uploadCatalogueImage,
  uploadViaUploadThing,
  uploadProfileImage,
  type CloudinaryFolder,
  type CloudinaryUploadResult,
  type UploadThingEndpoint,
} from "./media";

export {
  becomeParticulier,
  applyForShop,
  fetchSellerVerification,
  sendSellerVerificationMessage,
  addSellerVerificationDocument,
  fetchPublicSeller,
  toggleSellerLike,
  closeParticulier,
  closeShop,
  downgradeToParticulier,
  updateBundleSettings,
  setVacation,
  fetchProductLibrary,
  createLibraryItem,
  queueExcelImport,
} from "./sellers";

export {
  fetchMyKyc,
  submitMyKyc,
  uploadMyKycDocument,
  fetchOrgKyc,
  submitOrgKyc,
  uploadOrgKycDocument,
} from "./kyc";

export {
  getCart,
  clearCart as clearServerCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  checkout,
  type Cart,
} from "./cart";

export {
  fetchPurchases,
  fetchSales,
  fetchOrder,
  transitionOrderStatus,
  openDispute,
  fetchMyDisputes,
  addDisputeEvidence,
  addDisputeMessage,
  closeDispute,
  reopenDispute,
  acceptOrderOffer,
  refuseOrderOffer,
  payFullAfterOfferRefuse,
  cancelAfterOfferRefuse,
  sellerRefund,
  confirmReception,
  requestCourier,
  fetchSalesChart,
  fetchInvoiceReceipt,
  type OrderStatus,
} from "./orders";

export {
  fetchWalletBalance,
  fetchWalletLedger,
  requestWithdraw,
} from "./wallet";

export { fetchFavorites, addFavorite, removeFavorite } from "./favorites";

export {
  fetchNotifications,
  markNotificationRead,
  registerDevice,
  fetchNotificationPreferences,
  upsertNotificationPreference,
} from "./notifications";

export {
  fetchMyOffers,
  fetchListingOffers,
  createOffer,
  acceptOffer,
  refuseOffer,
} from "./offers";

export {
  fetchConversations,
  createConversation,
  fetchMessages,
  sendMessage,
} from "./messaging";

export {
  fetchAdminMe,
  fetchPlatformSettings,
  updatePlatformSettings,
  fetchAuditLogs,
  provisionAudience,
  hideReview,
  hideComment,
  fetchSellerVerifications,
  approveSellerVerification,
  rejectSellerVerification,
  sendAdminShopVerificationMessage,
  fetchAdminOrgKyc,
  fetchAdminIndividualKyc,
  approveOrgKyc,
  rejectOrgKyc,
  requestOrgKycResubmission,
  approveIndividualKyc,
  rejectIndividualKyc,
  resolveDispute,
  fetchAdminListings,
  updateAdminListing,
  fetchAdminOrders,
  fetchAdminDisputes,
  fetchAdminWallets,
  fetchAdminSessions,
  fetchAdminReports,
  fetchAdminPartners,
  createAdminPartner,
  fetchAdminCouriers,
  updateAdminCourier,
  fetchAdminTariffs,
  saveAdminTariffs,
  fetchAdminRapports,
  fetchAdminStats,
  markDisputeReview,
  resolveAdminReport,
  askDisputeParty,
  fetchAuthAdminUsers,
  fetchAuthAdminUser,
  createAuthAdminUser,
  updateAuthAdminUser,
  setAuthAdminRole,
  setAuthAdminPassword,
  removeAuthAdminUser,
  listAuthAdminUserSessions,
  revokeAuthAdminUserSession,
  revokeAuthAdminUserSessions,
  impersonateAuthAdminUser,
  stopAuthAdminImpersonating,
  authAdminHasPermission,
  banAuthUser,
  unbanAuthUser,
  type AdminListing,
  type AuthAdminUser,
  type AuthAdminSession,
} from "./admin";

export {
  fetchCourierMe,
  updateCourierAvailability,
  fetchCourierMissions,
  fetchOpenMissions,
  acceptMission,
  progressMission,
  transferMission,
  fetchCourierGains,
} from "./courier";

export { authorizePusher, authorizeBeams } from "./pusher";

export { fetchHealth, fetchReady } from "./health";
