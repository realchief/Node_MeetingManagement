var fs = require('fs')
var _ = require('lodash');

exports.email  = { 
  
  to: 'martymix@gmail.com',
  template: 'template',
  
  replacements : { 
    sender: 'marty@loosegrip.net',
    meeting_time: 'Tuesday, June 12th, 2018 at 9:34 am',
    meeting_date: 'Tue, June 12',
    summary: 'Sales Meeting',
    subject: 'MeetBrief for',
    headline: 'Your Engagement Score is up with a big increase in time spent watching video on Facebook.',
    brand: 'your team',
    interest_change: '1',
    interest_score: '75',
    interest_status: 'positive',
    interest_chart: 'chart-1.png',
    engagement_change: '6',
    engagement_score: '61',
    engagement_status: 'positive',
    engagement_chart: 'chart-2.png',
    demand_change: '-2',
    demand_score: '60',
    demand_status: 'negative',
    demand_chart: 'chart-3.png',
   "action_items": [
   "On Facebook, visitors watched more video, with 46 minutes, 27 seconds watched, an increase of 44 minutes, 25 seconds. <strong>Figure out the recipe to the secret sauce, and then create more content just like it.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#engagement</span>",
   "Conversions are down sitewide, with 13 fewer conversions. Your form is just not converting. <strong>Here are some reasons why that may be.</strong> Check out our guide: <a href=\"http://meetbrief.com/2018/05/23/youre-not-collecting-leads-because-your-form-sucks/\" target=\"blank\" >You're not collecting leads because your form sucks</a>. <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#Demand</span>",
    "Driving visitors: <a href=\"https://www.facebook.com/InstagramEnglish/posts/2008636519170393/\" target=\"blank\" >This Facebook post</a> had 27 link clicks, the most of all Facebook content. <strong>Since this content is keeping your fans and followers engaged, continue to incorporate it in your social sharing.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Engagement</span>"
  ],
  "talking_points": [
   "Average time spent on page is down site-wide from 4 minutes, 29 seconds to 3 minutes, 17 seconds. <strong>Have you guys considered creating a quiz for your content marketing program?</strong> <a href=\"http://meetbrief.com/2018/05/23/q-who-should-use-a-quiz-for-content-marketing/\" target=\"blank\" >Q: Who should use a quiz for content marketing?</a> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#engagement</span>",
    "Organic Reach is up; you reached 1,840 users on Facebook through organic social posts.. <strong>How can you replicate this success?</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Interest</span>",
    "You didn't have any paid reach on Facebook this period. <strong>What gives?</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Demand</span>"
  ]
  }

}


exports.email_lg  = { 
  
  to: 'martymix@gmail.com',
  template: 'template',
  
  replacements : { 
    sender: 'marty@loosegrip.net',
    meeting_time: 'Tuesday, June 12th, 2018 at 9:34 am',
    meeting_date: 'Tue, June 12',
    summary: 'Sales Meeting',
    subject: 'MeetBrief for',
    headline: 'A drop in website conversions is dragging down your Demand Score.',
    brand: 'LooseGrip',
    interest_change: '3',
    interest_score: '73',
    interest_status: 'positive',
    interest_chart: 'chart-1.png',
    engagement_change: '4',
    engagement_score: '68',
    engagement_status: 'positive',
    engagement_chart: 'chart-2.png',
    demand_change: '-8',
    demand_score: '62',
    demand_status: 'negative',
    demand_chart: 'chart-3.png',
    "action_items": [
   "Conversions are down sitewide, with 13 fewer conversions. <strong>Here are some reasons why that may be.</strong> Check out our guide: <a href=\"http://meetbrief.com/2018/05/23/youre-not-collecting-leads-because-your-form-sucks/\" target=\"blank\" >You're not collecting leads because your form sucks</a>. <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#Demand</span>",
    "Returning users are up site-wide, with 323 new users, a 64.29% increase. <strong>Take a look at the source of these new visitors, and replicate it for other content</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Interest</span>",
    "Driving visitors: <a href=\"https://www.facebook.com/InstagramEnglish/posts/2008636519170393/\" target=\"blank\" >This Facebook post</a> had 27 link clicks, the most of all Facebook content. <strong>Since this content is keeping your fans and followers engaged, continue to incorporate it in your social sharing.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Engagement</span>"
  ],
  "talking_points": [
    "Average time spent on page is down site-wide from 4 minutes, 29 seconds to 3 minutes, 17 seconds. <strong>Have you guys considered creating a quiz for your content marketing program?</strong> <a href=\"http://meetbrief.com/2018/05/23/q-who-should-use-a-quiz-for-content-marketing/\" target=\"blank\" >Q: Who should use a quiz for content marketing?</a> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#engagement</span>",
    "Organic Reach is up; you reached 1,840 users on Facebook through organic social posts.. <strong>How can you replicate this success?</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Interest</span>",
    "You didn't have any paid reach on Facebook this period. <strong>What gives?</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Demand</span>"
  ]
  }

}


exports.email_unilever  = { 
  
  to: 'martymix@gmail.com',
  template: 'template',
  
  replacements : { 
    sender: 'marty@loosegrip.net',
    meeting_time: 'Tuesday, June 12th, 2018 at 9:34 am',
    meeting_date: 'Tue, June 12',
    summary: 'Sales Meeting',
    subject: 'MeetBrief for',
    headline: 'A jump in ecommerce revenue has led to an increase in your Demand Score.',
    brand: 'Unilever',
    interest_change: '2',
    interest_score: '72',
    interest_status: 'positive',
    interest_chart: 'chart-1.png',
    engagement_change: '-2',
    engagement_score: '58',
    engagement_status: 'positive',
    engagement_chart: 'chart-2.png',
    demand_change: '10',
    demand_score: '74',
    demand_status: 'positive',
    demand_chart: 'chart-2.png',
    "action_items": [
   "You made some money! Revenue has increased $209.74 for a total of $739.79, a 39.57% increase. <strong>Nice work! Whatever you're doing, keep doing it.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Demand</span>",
    "Returning website users are down, from 4,970 to 4,554, a 8.37% drop. <strong>Take a look at the source of these new visitors, and see why things are not working.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#Interest</span>",
    "<a href=\"https://www.facebook.com/benandjerrysUS/videos/10155608360376461/\" target=\"blank\" >This Facebook post</a> is at the top of the charts, with the greatest number of post engagements at 3,460. <strong>Since this content is keeping your fans and followers engaged, continue to incorporate it in your social sharing.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Engagement</span>"
  ],
  "talking_points": [
    "Average time spent on page is down site-wide 6 seconds from 1 minute, 12 seconds to 1 minute, 6 seconds. <strong>Have you guys considered creating a quiz for your content marketing program?</strong> <a href=\"http://meetbrief.com/2018/05/23/q-who-should-use-a-quiz-for-content-marketing/\" target=\"blank\" >Q: Who should use a quiz for content marketing?</a> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#engagement</span>",
    "On Facebook, your organic reach was down 212,869 users, for a total of 251,483 users, a change of 45.84%. <strong>What's going on here?</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #E87060;\">#Interest</span>",
    "Your work is paying off; you reached 1,265,224 more users on Facebook through paid reach, an increase of 6.83% - for a total of 19,783,674 users. <strong>Nice work! Whatever you're doing, keep doing it.</strong> <span class=\"bucket-with\" style=\"display: inline-block;color: #fff;border-radius: 4px;font-size: 11px;padding: 2px 6px;text-transform: uppercase;font-family: verdana; background: #80C659;\">#Demand</span>"
  ]
  }

}



exports.processEmail = function( emailContent ) {

  var emailContent = JSON.parse(JSON.stringify(emailContent));

  /* DELTA CHANGE COLORS */

  if ( parseInt(emailContent.replacements.interest_change) < 0 ) {
    emailContent.replacements.interest_chart = 'chart-3.png'
  }

  if ( parseInt(emailContent.replacements.demand_change) < 0 ) {
    emailContent.replacements.demand_chart = 'chart-3.png'
  }

  if ( parseInt(emailContent.replacements.engagement_change) < 0 ) {
    emailContent.replacements.engagement_chart = 'chart-3.png'
  }
  
  var interest_change = emailContent.replacements.interest_change;
  var demand_change = emailContent.replacements.demand_change;
  var engagement_change = emailContent.replacements.engagement_change;

   emailContent.replacements.interest_change =  this.wrapWithHTML( interest_change, 'status-color' )
  emailContent.replacements.demand_change =  this.wrapWithHTML( demand_change, 'status-color' )
  emailContent.replacements.engagement_change =  this.wrapWithHTML( engagement_change, 'status-color' )

    
  return new Promise(function(resolve, reject) {

    if ( typeof emailContent.template !== 'undefined') {
    
      var template = emailContent.template
   
      fs.readFile("static/assets/templates/" + template  + ".html", "utf8", function(err, data) {
      
        if (err) {
         console.log(err);
        }

        var replacements = emailContent.replacements

        var emailActionItems = '<tr><td style="border-collapse:collapse;padding-top:0px;padding-bottom:20px;padding-right:0px;padding-left:0px;line-height:1.4em;">'
        emailActionItems += replacements.action_items.join('</td></tr><tr><td style="border-collapse:collapse;padding-top:0px;padding-bottom:20px;padding-right:0px;padding-left:0px;line-height:1.4em;">')
        emailActionItems += '</td></tr>'

        replacements.action_items = emailActionItems

        var emailTalkingPoints = '<tr><td style="border-collapse:collapse;padding-top:0px;padding-bottom:20px;padding-right:0px;padding-left:0px;line-height:1.4em;">'
        emailTalkingPoints += replacements.talking_points.join('</td></tr><tr><td style="border-collapse:collapse;padding-top:0px;padding-bottom:20px;padding-right:0px;padding-left:0px;line-height:1.4em;">')
        emailTalkingPoints += '</td></tr>'

        replacements.talking_points = emailTalkingPoints
         
        var emailToSend = data.replace(/{{(\w+)}}/g, function (m, m1) {
            return replacements[m1] || m;  
        });

        resolve( {
            emailToSend : emailToSend,
            data : emailContent.replacements
        });

      })

    } else {

        reject( 'no email sent!' );

    }

  })

}


exports.wrapWithHTML = function(value, param, status) {

   // console.log( 'on load', value, typeof(value))

   var statusPrefix = ""
  
    var getInlineStyle = function(param, value) {

      var style = "";

      switch ( param ) {

        case 'status' :

          switch ( value ) {

            case 'positive' :
              style = 'background: #80C659;'
            break

            case 'negative' :
              style = 'background: #E87060;'
            break

            default :
              style = 'background: #eda97c;'
            break

          }

          
        break

        case 'status-color' :

          switch ( value ) {

            case 'positive' :
              style = 'color: #80C659;'
              statusPrefix = "+"
            break

            case 'negative' :
              style = 'color: #E87060;'
            break

            default :
              style = 'color: #ddd;'
            break

          }

          
        break

      }

      return style;

    }

    var value = parseInt(value)
    var status = status || "";

    // console.log( 'on changed', value, typeof(value))

    if ( value > 0 ) {
      status = 'positive'
    } else if ( value < 0 ) {
      status = 'negative'
    } else if ( value == 0 ) {
      status = 'neutral'
    }



    var inlineStyle = getInlineStyle( param, status )

    return '<span style="' + inlineStyle + '">' + statusPrefix + value + '</span>';

}