/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// Some details about the site

exports.siteName = 'FingerTips';
exports.marketName = 'FingerTips';
exports.description = "Answers before the Ask";
exports.canonical = "http://www.getfingertips.com";
exports.socialImage = "";
exports.socialTitle = "" 
exports.socialContent = ""
exports.twitterShareURL = ""
exports.facebookShareURL = ""

exports.google_analytics_id = process.env.GOOGLE_ANALYTICS_ID;
exports.mixpanel_id = process.env.MIXPANEL_ID;
exports.secureCookies = process.env.SECURE_COOKIES;