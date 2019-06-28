/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    const docsUrl = this.props.config.docsUrl;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    return `${baseUrl}${docsPart}${langPart}${doc}`;
  }

  pageUrl(doc, language) {
    const baseUrl = this.props.config.baseUrl;
    return baseUrl + (language ? `${language}/` : '') + doc;
  }

  render() {
    return (
      <footer className="nav-footer" id="footer">
        <section className="sitemap">
          <a href={this.props.config.baseUrl} className="nav-home">
            {this.props.config.footerIcon && (
              <img
                src={this.props.config.baseUrl + this.props.config.footerIcon}
                alt={this.props.config.title}
                width="100"
                height="100"
              />
            )}
          </a>
          <div>
            <h5>Docs</h5>
            <a href={this.docUrl('getting-started')}>
              Getting Started
            </a>
            <a href={this.docUrl('support')}>
              Get Help
            </a>
            <a href={this.docUrl('contribute')}>
              Contribute
            </a>
          </div>
          <div>
            <h5>Community</h5>
            <a href={this.pageUrl('support')}>
              Get Help
            </a>
            <a href="https://panoptescommunity.slack.com/">Slack</a>
            <a
              href="https://yahoodevelopers.tumblr.com/"
              target="_blank"
              rel="noreferrer noopener">
              Blog
            </a>
          </div>
          <div>
            <h5>More</h5>
            <a
              href="https://github.com/yahoo/panoptes"
              target="_blank"
              rel="noreferrer noopener">
              GitHub
            </a>
            <a
              href="https://github.com/yahoo/panoptes/issues"
              target="_blank"
              rel="noreferrer noopener">
              Report an Issue
            </a>

          </div>
        </section>
        <section className="copyright">{this.props.config.copyright} Unless otherwise noted, all content on this site is provided under the <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC-BY-SA-4.0 license</a>.</section>
      </footer>
    );
  }
}

module.exports = Footer;
