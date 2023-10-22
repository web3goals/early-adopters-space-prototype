export const ACTIVITY_TYPE_SEND_FEEDBACK = "SEND_FEEDBACK";
export const ACTIVITY_TYPE_FOLLOW_TWITTER = "FOLLOW_TWITTER";
export const ACTIVITY_TYPE_FOLLOW_LENS = "FOLLOW_LENS";
export const ACTIVITY_TYPE_TRY_DEMO = "TRY_DEMO";
export const ACTIVITY_TYPE_INVITE_FRIENDS = "INVITE_FRIENDS";
export const ACTIVITY_TYPES = [
  ACTIVITY_TYPE_SEND_FEEDBACK,
  ACTIVITY_TYPE_FOLLOW_TWITTER,
  ACTIVITY_TYPE_FOLLOW_LENS,
  ACTIVITY_TYPE_TRY_DEMO,
  ACTIVITY_TYPE_INVITE_FRIENDS,
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
    title: "🗣️ Send feedback",
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
    title: "🐥 Follow us on Twitter",
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
  [ACTIVITY_TYPE_FOLLOW_LENS]: {
    title: "🌿 Follow us on Lens",
    addActivityForm: {
      contentFieldTitle: "Handle",
      contentFieldPlaceholder: "@familyfinance",
    },
    completeActivityForm: {
      contentFieldTitle: "Handle",
      contentFieldPlaceholder: "@bobemerson",
    },
    icon: "🌿",
  },
  [ACTIVITY_TYPE_TRY_DEMO]: {
    title: "👆 Try demo",
    addActivityForm: {
      contentFieldTitle: "Comment",
      contentFieldPlaceholder: "Try creating an account...",
    },
    completeActivityForm: {
      contentFieldTitle: "Feedback",
      contentFieldPlaceholder: "UX is awesome, but...",
    },
    icon: "👆",
  },
  [ACTIVITY_TYPE_INVITE_FRIENDS]: {
    title: "✨ Invite friends",
    addActivityForm: {
      contentFieldTitle: "Comment",
      contentFieldPlaceholder: "Invite your friends using you code...",
    },
    completeActivityForm: {
      contentFieldTitle: "Code",
      contentFieldPlaceholder: "My code is...",
    },
    icon: "✨",
  },
};
