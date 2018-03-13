import React, { Component } from "react";
import axios from "axios";

class Home extends Component {
  render() {
    return (
      <div>
        <p>
          “Foreign Insight” is a web mashup that translates and evaluates
          trending articles provided by German news outlets. The project
          provides a copy of the top ten trending articles for a given news
          source, as well as a translated copy of these articles before finally
          returning an aggregated sentiment analysis of all the translated
          articles. The project is designed to provide convenient insight into
          alternative news sources that users might not otherwise have
          considered or have been able to access.
        </p>

        <p>
          The way language influences perception and thought is a fascinating
          topic. All language is ultimately arbitrary and the way in which
          sentences are constructed is affected by the language in which they’re
          written. Specifically, and relevantly, the way in which the German
          language constructs events is decidedly more holistic and goal
          orientated than the way in which the English language constructs
          events. This project aims to highlight some of these perceptive
          differences (via translation) and their subsequent effect on the way
          news is reported (via sentiment analysis) in a simplified way.
        </p>
      </div>
    );
  }
}

export default Home;
