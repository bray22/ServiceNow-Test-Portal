/*
* Hub.js
*
* All User-Facing strings and messages for the core Hub application are located here
*/

define({
    root: {
        TheHubName: "TheHub",
        Desktops: "Desktops",
        WidgetLaunchAppmode: "Launch App Mode",
        WidgetSettings: "Settings",
        WidgetSubmitBug: "Submit a Bug",
        WidgetHelp: "Help",
        WidgetRemove: "Remove Widget",
        WidgetHelpModalTitle: "Widget Help: ",
        ConfigHeaderTitle: "Widget Settings",
        ConfigHeaderInputPlaceholder: "New widget name",
        ConfigHeaderRenameButton: "Rename",
        ConfigHeaderRenameTitle: "Widget Name",
        NavSearchPlaceholder: "Launch Services and Widgets",
        NavSearchWidgetGroup: "Widgets",
        NavSearchServiceGroup: "Services",
        NavSearchSearchEMC: "Search EMC",
        SearchResultAdd: "Add to your current desktop",
        SearchResultAppmode: "Launch widget in appmode",
        HelpMenuReleaseNotes: "Release Notes",
        HelpMenuReportProblem: "Report problem with TheHub",
        HelpMenuRequestEnhancement: "Request an enhancement",
        HelpMenuAskQuestion: "Ask a question",
        HelpMenuWalkthrough: "Walkthrough",
        HelpMenuWiki: "TheHub Wiki",
        HelpMenuStyleGuide: "Style Guide",
        HelpMenuFAQ: "FAQ",
        AlertMenuTitle: "Alerts",
        AlertMenuManageSubscriptions: "Manage subscriptions",
        AlertMenuManageSubscriptionsTitle: "Manage Subscriptions",
        AlertMenuClearList: "Clear alerts",
        AlertMenuViewAll: "View all alerts",
        AlertMenuViewAllTitle: "All Alerts",
        AlertDismiss: "Dismiss Alert",
        ReleaseNotesTitle: "Release Notes",
        CreateIncidentTitle: "Create Incident",
        RequestEnhancementTitle: "Enhancement Request",
        FAQTitle: "Frequently Asked Questions",
        CloseAppmodeBtnTitle: "Close Appmode",
        DeepLinkAppmodeBtnTitle: "Generate DeepLink",
        AppModeHelp: "View help wiki",
        LivewireTrigger: "TheHub Chat",
        AlertSaveErrorMsg: "Failed to save alert status",
        DesktopSaveFailure: "Failed to save desktop contents",
        SharedDesktopLink: "View Shared Desktops",
        CreateNewDesktop: "Create Desktop",
        SharedDesktopsTitle: "Shared Desktops",
        NewDesktopPlaceholder: "Desktop Name",
        DesktopCreateTooltip: "Create Desktop",
        DesktopCancelTooltip: "Cancel",
        DesktopCreateErrorMessage: "Failed to create desktop",
        DesktopOptionRename: "Rename",
        DesktopOptionDelete: "Delete",
        DesktopOptionShare: "Share",
        DesktopOptionUnShare: "UnShare",
        DesktopUnShareFailure: "Failed to update your shared desktop status, please try again later.",
        DesktopOptionClone: "Clone",
        CloneSwitchTitle: "Switch Desktop?",
        CloneSwitchMessage: "Your desktop has been cloned, would you like to switch to it now?",
        CloneFailure: "The desktop failed to clone, please try again later.",
        CloneSwitchYes: "Switch desktops",
        CloneSwitchNo: "Stay here",
        DesktopRenameTooltip: "Save new name",
        DesktopRenameCancel: "Cancel new name",
        DesktopRenameFailure: "Failed to save desktop name",
        ShareDesktopModalTitle: "Share Desktop Options",
        LastDesktopDeleteError: "You cannot delete your only desktop",
        DeleteDesktopError: "Failed to delete desktop: ",
        ConfirmationTitle: "Please Confirm",
        DeleteDesktopConfirmMessage: "Delete desktop: '{{ Name }}', Are you sure?",
        Delete: "Delete",
        Cancel: "Cancel",
        EmptyAlertsMessage: "There are no new notifications",
        MyInformationTitle: "My Information",
        ConfigureWidgetModalTitle: "Configuration",
        DeepLinkFailure: "Failed to generate a DeepLink",
        DeepLinkMessage: "You can share your appmode view with this link: ",
        DeepLinkNoWidget: "The widget associated with this DeepLink no longer exists",
        DeepLinkExpired: "The DeepLink is no longer valid",
        ExpirationTitle: "Your session has expired",
        ExpirationBody: "Please <span id='expiration-reload'>refresh</span> your browser to continue working.",
        ReloadMessage: "Reload TheHub?",
        Reload: "Reload",
        ContentLibraryTitle: "Content Library",
        ContentLibrarySearchPlaceholder: "Search for widgets",
        ContentLibrarySearchLabel: "Widget Search",
        ContentLibraryBUFilterLabel: "Filter by BU",
        ContentLibraryRoleFilterLabel: "Filter by Role",
        AllBU: "All Business Units",
        AllRoles: "All Roles",
        MyBU: "My Business Unit",
        MyRole: "My Role",
        ContentLibraryOptionAdd: "Add to desktop",
        ContentLibraryOptionAppmode: "Launch in appmode",
        ContentLibraryOptionHelp: "View help wiki",
        ContentLibrarySortBy: "Sort by:",
        ContentLibrarySortAlpha: "Alphabetical",
        ContentLibrarySortPopularity: "Popularity",
        ContentLibraryAccessControlTooltip: "Access Controls",
        AccessControlTitle: "Edit {{ Name }} Access Controls",
        TemporaryAppmodeSaveFailure: "There was a problem saving a temporary instance of this widget; if this issue persists, please submit a defect for this widget",
        FatalOops: "Oops!",
        FatalMessage: "Sorry, something is not working properly while loading TheHub",
        FatalButton: "Reload Browser",
        InvalidTitle: "Your browser is not supported",
        InvalidMessage: "To use TheHub, we recommend using the latest version of Chrome, Firefox, IE, or Safari.",
        NewsMenuTitle: "News & Announcements",
        NewsArticleTitle: "News Articles",
        NewsArticleSearchPlaceholder: "Search",
        NewsSelectAll: "Select All",
        NewsMarkAsRead: "Mark as Read",
        NewsChannelNotFound: "Channel not found",
        NewArticle: "NEW",
        NewsArticleNotFound: "News article not found",
        NewsCreateChannel: "Create a new Channel",
        NewsCreateChannelTitle: "New Channel",
        NewsManageChannels: "Manage Channels",
        NewsSubscribeChannels: "Subscribe to Channels",
        NewsNewArticle: "New Article",
        NewsNoChannelList: "News Channels is currently unavailable, please try again later",
        Done: "Done",
        NewsSubscriptionFailure: "Failed to toggle your subscription status, please try again later",
        NewsMandatoryChannel: "This is a mandatory channel, it is not possible to un-subscribe",
        MaintenanceKeepWorking: "Keep working",
        MaintenanceTakeABreak: "Take a break",
        MaintenanceTitle: "TheHub Maintenance",
        MaintenanceMessage: "Please excuse the interuption... TheHub needs to go offline for a short maintenance break. You can attempt to keep working but we cannot guarantee stability. Would you like to take a break?",
        MaintenancePageTitle: "Maintenance in Progress",
        MaintenancePageText1: "We are busy updating TheHub for you.",
        MaintenancePageText2: "We'll be back up and running shortly, so please try again soon. Thanks for your patience!",
        HubPoweredBy: "Powered by EOS<sup>2</sup> EngSrv & LabOps",
        BroadcastMessagingTitle: "TheHub Broadcast Messages",
        BroadcastMessagingConfirm: "Okay",
        PopupBlockerNotificationTitle: "Popup Blocker Detected",
        PopupBlockerNotificationMessage: "Please allow popups on this website.",
        PopupBlockerNotificationConfirm: "Okay",
        SlowLoadingMessage: "Authentication is taking longer than usual, hang on tight, or try refreshing your browser.",
        ModalNavBack: "Back",
        ModalDeepLinkTitle: "Your Deep Link",
        ModalDeepLinkMessage: "You can come directly here with this link: ",
        ModalDeepLinkCopy: "Copy URL",
        ModalDeepLinkError: "An error occurred while creating your deeplink, please try again later.",
        ModalDeepLinkCopySuccess: "Url has been copied to your clipboard!",
        ModalDeepLinkCopyFailure: "Failed to copy the url to your clipboard.",
        NavbarIncidentModalTitle: "Request Support",
        ContentLibraryIconTooltip: "Content Library",
        NewsIconTooltip: "News and Announcements",
        IncidentIconTooltip: "Request Support",
        AlertIconTooltip: "Alerts and Notifications",
        HelpIconTooltip: "Help and Information",
        Walkthrough_Title: "Welcome to TheHub!",
        Walkthrough_Message: "Welcome to TheHub, before you get started lets make sure your information is up-to-date and walk through some of the basics.",
        Walkthrough_SkipOption: "Skip Walkthrough",
        Walkthrough_BeginOption: "Begin",
        Walkthrough_Step1_Message: "Please review your information and adjust roles or locations, you can always make changes later by clicking on your user icon in the top right.",
        Walkthrough_Step1_UserBalloonMessage: "My Information Link",
        Walkthrough_Step2_Message: "You will periodically receive alerts from various tracking systems TheHub is connected to, please select a few of these alerts you may be interested in. You can always modify these alert subscriptions later.",
        Walkthrough_Step3_Message: "Take a moment to subscribe yourself to a few News and Announcement channels.",
        Walkthrough_Step4_Title: "Desktops",
        Walkthrough_Step4_Message: "We've already created a desktop for you to add widgets to; you can create, rename, share, and modify your own here.",
        Walkthrough_Step5_Title: "Search",
        Walkthrough_Step5_Message: "You can search for all available widgets and services in TheHub via the universal search-bar.",
        Walkthrough_Step6_Title: "Content Library",
        Walkthrough_Step6_Message: "Search and add widgets from the Content Library.",
        Walkthrough_Step7_Title: "Help & Information",
        Walkthrough_Step7_Message: "View release notes, FAQ, Wiki pages, and general helpful information.",
        Walkthrough_Step8_Title: "Alerts",
        Walkthrough_Step8_Message: "View Alerts and Notifications, you can also change your subscriptions here.",
        Walkthrough_Step9_Title: "News",
        Walkthrough_Step9_Message: "Read News and Announcements, create a new channel, or modify your subscriptions.",
        Walkthrough_Step10_Title: "Support",
        Walkthrough_Step10_Message: "Submit an Incident or Service Request.",
        Walkthrough_Step11_Title: "Widgets",
        Walkthrough_Step11_Slide1: "Move and re-arrange your desktop widgets by dragging and dropping them to new locations.",
        Walkthrough_Step11_Slide2: "Try changing a widget's size to enable different kinds of views, offering more or less information and different functionality.",
        Walkthrough_Step11_Slide3: "On the widget footer, you can launch Appmode (if available), change settings (or contact the developer), submit a bug, go to the wiki-help page, or remove it from your desktop.",
        Walkthrough_Step12_Title: "Welcome to TheHub!",
        Walkthrough_Step12_Message: "TheHub is comprised of many of widgets and connected systems, made by TheHub Dev Team, and open contributors alike.<br/><br/>" + 
                                    "If you have an idea for a new widget or new functionality for TheHub, we want to hear from you! You can request new Hub features, or request to be an open contributor yourself from within the Open Contribution (OCM) widget we've added to your desktop.<br/><br/>" +
                                    "Welcome to TheHub!<br/><br/>" +
                                    "-TheHub Dev Team",
        Walkthrough_Step12_Button: "Get Started!",
        Walkthrough_NextStep: "Next",
        SharedDesktopPreview: "(Preview) "
    },
    "pr": true
});