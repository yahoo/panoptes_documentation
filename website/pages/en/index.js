/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const MarkdownBlock = CompLibrary.MarkdownBlock; /* Used to read markdown */
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

class HomeSplash extends React.Component {
  render() {
    const {siteConfig, language = ''} = this.props;
    const {baseUrl, docsUrl} = siteConfig;
    const docsPart = `${docsUrl ? `${docsUrl}/` : ''}`;
    const langPart = `${language ? `${language}/` : ''}`;
    const docUrl = doc => `${baseUrl}${docsPart}${langPart}${doc}`;

    const SplashContainer = props => (
      <div className="homeContainer">
        <div className="homeSplashFade">
          <div className="wrapper homeWrapper">{props.children}</div>
        </div>
      </div>
    );

    const Logo = props => (
      <div className="projectLogo">
        <img src={props.img_src} alt="Project Logo" />
      </div>
    );

    const ProjectTitle = () => (
      <h2 className="projectTitle">
        <small>{siteConfig.tagline}</small>
      </h2>
    );

    const PromoSection = props => (
      <div className="section promoSection">
        <div className="promoRow">
          <div className="pluginRowBlock">{props.children}</div>
        </div>
      </div>
    );

    const Button = props => (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={props.href} target={props.target}>
          {props.children}
        </a>
      </div>
    );

    return (
      <SplashContainer>
        <div>
            <div className="blockImage">
                <Logo img_src={`${baseUrl}img/panoptes_full_logo_white.svg`} />
            </div>
            <div className="blockContent">
              <ProjectTitle siteConfig={siteConfig} />
              <PromoSection>
                <Button href="#try">Try It Out</Button>
                <Button href={docUrl('getting-started.html')}>Getting Started</Button>
              </PromoSection>
            </div>
        </div>
      </SplashContainer>
    );
  }
}

class Index extends React.Component {
  render() {
    const {config: siteConfig, language = ''} = this.props;
    const {baseUrl} = siteConfig;

    const Block = props => (
      <Container
        padding={['bottom', 'top']}
        id={props.id}
        background={props.background}>
        <GridBlock
          align="center"
          contents={props.children}
          layout={props.layout}
        />
      </Container>
    );

    const TryOut = () => (
      <Block id="try">
        {[
          {
            content: 'Give it a try jammed into a tiny [Docker container](https://github.com/yahoo/panoptes_docker).  ' +
                'We\'re breaking all the rules here. ' +
                '```git clone git@github.com:yahoo/panoptes_docker.git \```<br/>' +
                '`&& cd panoptes_docker && docker build . -t panoptes_docker`<br/><br/>' +
                'Fire that bad boy up with `docker run -d --sysctl net.core.somaxconn=511 --name="panoptes_docker" --shm-size=2G -p 127.0.0.1:8080:3000/tcp panoptes_docker`<br/><br/>' +
              'Read more about this at the [Panoptes Docker](https://github.com/yahoo/panoptes_docker) repo.',
            image: `${baseUrl}img/share-arrow.svg`,
            imageAlign: 'left',
            title: 'Try it Out',
          },
        ]}
      </Block>
    );

    const Description = () => (
      <Block background="dark">
        {[
          {
            content:
              'This is an additional section to describe something important about this project.<br/> **Example:** It\'s very easy to adapt the styling and documentation structure of this site to fit the branding and docs needs of your project.',
            image: `${baseUrl}img/code-programming.svg`,
            imageAlign: 'right',
            title: 'Description',
          },
        ]}
      </Block>
    );

    const LearnHow = () => (
      <Block background="light">
        {[
          {
            content: 'Panoptes is built with a plugin architecture over well-tested base technologies',
            image: `${baseUrl}img/panoptes_architecture.png`,
            imageAlign: 'right',
            title: 'Panoptes System Architecture',
          },
        ]}
      </Block>
    );

    const Features = () => (
      <Block layout="fourColumn">
        {[
          {
            content: 'Built for scale from the ground up. Distributed ' +
              'task-scheduling with [Celery](http://www.celeryproject.org/). High frequency collection of metrics, ' +
              'low frequency collection of enrichments.',
            image: `${baseUrl}img/network-mapping.svg`,
            imageAlign: 'top',
            title: 'Horizontal Scaling',
          },
          {
            content: 'Hundreds of thousands of interfaces and tens of millions of time-series data points.<br/> Built on proven and **well understood** technologies. [Python](//:python.org), ' +
                '[Zookeeper](https://zookeeper.apache.org/), [Kafka](https://kafka.apache.org/) ' +
                ' & [Redis](https://redis.io/).',
            image: `${baseUrl}img/tank-svgrepo-com.svg`,
            imageAlign: 'top',
            title: 'Battle-tested',
          },
          {
            content: 'Any subsystem can be **extended** with Python code using well-defined interfaces.',
            image: `${baseUrl}img/node.svg`,
            imageAlign: 'top',
            title: 'Plugin Architecture',
          },
          {
            content: '[Apache 2.0  Licensing](https://www.apache.org/licenses/LICENSE-2.0.html). Take it, use it, ' +
                'extend it.  We\'re contributing plugins, and we\'re encouraging others to do the same.' ,
            image: `${baseUrl}img/asf-feather.svg`,
            imageAlign: 'top',
            title: 'Open Source',
          },
        ]}
      </Block>
    );

    const Showcase = () => {
      if ((siteConfig.contributors || []).length === 0) {
        return null;
      }

      const showcase = siteConfig.contributors
        .filter(user => user.pinned)
        .map(user => (
          <a href={user.infoLink} key={user.infoLink}>
            <img src={user.image} alt={user.caption} title={user.caption} />
          </a>
        ));

      const pageUrl = page => baseUrl + (language ? `${language}/` : '') + page;

      return (
        <div className="productShowcaseSection paddingBottom">
          <h2>Who Contributes to This?</h2>
          <p>This project is built by these awesome people</p>
          <div className="logos">{showcase}</div>
          
        </div>
      );
    };

    return (
      <div>
        <HomeSplash siteConfig={siteConfig} language={language} />
        <div className="mainContainer">
          <Features />
          <LearnHow />
          <TryOut />
        </div>
      </div>
    );
  }
}

module.exports = Index;
