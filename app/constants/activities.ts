export const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";
export const ACTIVITY_TYPE_FOLLOW_TWITTER = "FOLLOW_TWITTER";
export const ACTIVITY_TYPES = [
  ACTIVITY_TYPE_SEND_FEEDBACK,
  ACTIVITY_TYPE_FOLLOW_TWITTER,
];
export const ACTIVITY_TYPE_PARAMS: {
  [key: string]: {
    title: string;
    addActivityForm: {
      contentFieldTitle: string;
      contentFieldPlaceholder: string;
    };
    completeActivityForm: {
      contentFieldTitle: string;
      contentFieldPlaceholder: string;
    };
    icon: string;
  };
} = {
  [ACTIVITY_TYPE_SEND_FEEDBACK]: {
    title: "Send feedback",
    addActivityForm: {
      contentFieldTitle: "Comment",
      contentFieldPlaceholder: "Try creating an account...",
    },
    completeActivityForm: {
      contentFieldTitle: "Feedback",
      contentFieldPlaceholder: "UX is awesome, but...",
    },
    icon: "🗣️",
  },
  [ACTIVITY_TYPE_FOLLOW_TWITTER]: {
    title: "Follow us on Twitter",
    addActivityForm: {
      contentFieldTitle: "Handle",
      contentFieldPlaceholder: "@familyfinance",
    },
    completeActivityForm: {
      contentFieldTitle: "Handle",
      contentFieldPlaceholder: "@bobemerson",
    },
    icon: "🐥",
  },
};
