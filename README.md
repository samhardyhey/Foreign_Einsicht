## 1.0 Foreign Einsicht
“Foreign Insight” is a web mashup that translates and evaluates trending articles provided by German news outlets. The
project provides a copy of the top ten trending articles for a given news source, as well as a translated copy of these articles
before finally returning an aggregated sentiment analysis of all the translated articles. The project is designed to provide
convenient insight into alternative news sources that users might not otherwise have considered or have been able to
access.

The way language influences perception and thought is a fascinating topic (though obviously beyond the scope of this
project). All language is ultimately arbitrary and the way in which sentences are constructed is affected by the language in
which they’re written. Specifically, and relevantly, the way in which the German language constructs events is decidedly
more holistic and goal orientated than the way in which the English language constructs events. This project aims to
highlight some of these perceptive differences (via translation) and their subsequent effect on the way news is reported (via
sentiment analysis) in a simplified way.

The application exists as an SPA, in which a react-router handles the view manipulation. Article and analysis requests are made to an express server from within the view components. The react part of the application is able to access the express API via a proxy configuration, allowing requests to be re-routed. 

## 2.0 Getting Started
### 2.1 Development
To allow for hot reloading, concurrently has been used to instantiate the react and express processes simultaneously. Run within /app as:
```bash
npm start
```

### 2.2 Production
Build and run the docker image in the usual fashion.

## 3.0 Built With
Node 8.9, NewsAPI 2.2, Google Cloud 0.57.0, React 16.

## 4.0 Authors
Sam Hardy - Implementation.

## 4.1 Resources
| Title/Author  | Link  |
| ------------- | ----- |
| Creating a Single-Page App in React using React Router - Kirupa     | https://www.kirupa.com/react/creating_single_page_app_react_using_react_router.htm |
| Express React Starter Template - Burke Holland | https://github.com/burkeholland/express-react-starter |
| News API | https://newsapi.org/ |
| Cloud Natural Language API - Google |  https://cloud.google.com/natural-language/ |