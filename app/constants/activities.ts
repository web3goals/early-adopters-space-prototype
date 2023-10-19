export const ACTIVITY_TYPES = ["SEND_FEEDBACK", "FOLLOW_TWITTER"];
export const ACTIVITY_TYPE_PARAMS: {
  [key: string]: {
    title: string;
    contentTitle: string;
    contentPlaceholder: string;
    icon: string;
  };
} = {
  SEND_FEEDBACK: {
    title: "Send feedback",
    contentTitle: "Comment",
    contentPlaceholder: "Try creating an account...",
    icon: "🗣️",
  },
  FOLLOW_TWITTER: {
    title: "Follow us on Twitter",
    contentTitle: "Handle",
    contentPlaceholder: "@familyfinance",
    icon: "🐥",
  },
};
