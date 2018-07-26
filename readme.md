# MeetBrief

npm install

npm start

Add this to a variables.env file at the root:

// node.js port  
PORT=3001	

// choose the version of the interface  
HOME_VERSION=fingertips

// set http:// to redirect to https:// within node.js router  
SECURE_ONLY=false


# High-level MeetBrief Functional Spec

**What is MeetBrief**

MeetBrief (http://www.meetbrief.com) delivers Marketing and Sales insights — health scores, action-items, and discussion points — for your next meeting. 

Example deliverable: [http://www.getfingertips.net/send](http://www.getfingertips.net/send))

**How?**


*   Users authorize data sources (like Facebook Page Insights or Google Analytics) with MeetBrief so we can pull and analyze data on their behalf.

*   Add "[invite@meetbrief.com](mailto:insights@meetbrief.com)" to a meeting invite. We'll then look at the meeting organizer and date/time to determine which company to find insights for and when to send.

*   All meeting attendees or just the organizer will receive this email, based on user options _or_ the email address used to "invite" meetbrief.

*   Thirty minutes (_by default_) before the meeting, MeetBrief looks for insights over all connected data sources and produces an email with three high-level "Health Scores," three "Action Items," and three "Talking Points" for metrics.

**There are three levels of reporting within MeetBrief — bucket, platform, asset.**



*   **Bucket-level**: High-level grouping with health scores from 0-100. There are three buckets right now: "engagement," "interest," and "demand."

*   **Platform-level**: Totals for a specific platform metric (total reach / returning users / pageviews, etc.). We look at two platforms right now: Google Analytics and Facebook Page Insights.

*   **Asset-level**: Dimension-based individual posts/pages (home page / facebook post / video, etc.)

**Relationships:**

_Asset-level_ metrics are related to a _platform-level_ metric. _Platform-level_ metrics are related to a _bucket_.

For example: 

1.  "Returning Users _on the Home Page_," a "_Google Analytics_" asset-level metric, relates to:

2.  "Total Returning Users," a "_Google Analytics_" platform-level metric, which relates to:

3.  The "_interest_" bucket, and affects its total "score."

**Platform Metric Weights:**

*   Not all metrics are of equal importance. Each platform-level metric has a weight multiplier.

*   Default weighting can be adjusted. 

*   The percent change of a metric is multiplied by the weight multiplier to sort the metrics by importance.

*   Look at the platform-level metrics with the largest weighted percentage change at each level to generate insights and talking points.


**Phrases (What to "talk about"):**

*   With the most important metrics sorted by weighted value, we know what to "talk about" for the current timeframe. 

*   Each metric's performance has an insight and an associated phrase. An insight, for example, is: "_Returning Website Users are down_"

*   The insight and phrases that are generated are based on tags that are applied to the platform metric and related assets. The tags generally include _source_, _level_, _sentiment_, and the _field name_. _Sentiment_ is whether the change is "positive" or "negative."

For example:

1.  A Google Analytics platform insight may be "Returning Website Users are down, from 2,092 to 1,676, a 19.89% drop." 

2.  The generated tags would be: _platform,negative,google_analytics,engaged_users

We then add one of two types of phrases to the insight:

1.  Actionable Items ("Check to see which page is causing the drop.")

2.  Talking Points ("Why do you think that is?")

**Bucket Scores: **

*   Each platform-level metric maps the current value to a percentile from 0-100 based on all historical values.

*   Each platform level metric has a "weight" which will be a multiplier. 

*   Bucket score equals the weighted mean of all related metric scores.
