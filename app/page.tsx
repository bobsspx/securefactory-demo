const services = [
  {
    number: "01",
    title: "Precision Manufacturing",
    text: "High-precision production solutions for industrial and commercial manufacturing requirements.",
  },
  {
    number: "02",
    title: "Quality Control",
    text: "Structured quality inspection processes designed to maintain consistent production standards.",
  },
  {
    number: "03",
    title: "Industrial Supply",
    text: "Reliable sourcing and delivery of manufacturing materials for business operations.",
  },
];

const metrics = [
  {
    value: "99.8%",
    label: "Production Quality",
  },
  {
    value: "15+",
    label: "Years Experience",
  },
  {
    value: "120+",
    label: "Business Clients",
  },
  {
    value: "24/7",
    label: "Operational Monitoring",
  },
];

const securityItems = [
  "HTTPS enforced",
  "Security headers configured",
  "Clickjacking protection",
  "Content-type protection",
  "Restricted browser permissions",
  "Secure deployment infrastructure",
];

export default function Home() {
  return (
    <main>
      <header className="navbar">
        <a href="#" className="logo">
          SECURE<span>FACTORY</span>
        </a>

        <nav className="navLinks">
          <a href="#company">Company</a>
          <a href="#services">Services</a>
          <a href="#operations">Operations</a>
          <a href="#security">Security</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#contact" className="navButton">
          Request Quote
        </a>
      </header>

      <section className="hero">
        <div className="heroContent">
          <p className="eyebrow">
            INDUSTRIAL MANUFACTURING • QUALITY • SECURITY
          </p>

          <h1>
            Manufacturing
            <br />
            built for modern
            <br />
            business.
          </h1>

          <p className="heroDescription">
            SecureFactory provides modern manufacturing and industrial
            solutions with a focus on reliability, operational visibility
            and digital security.
          </p>

          <div className="heroActions">
            <a href="#services" className="primaryButton">
              Explore Services
            </a>

            <a href="#company" className="secondaryButton">
              About Company
            </a>
          </div>
        </div>

        <div className="heroVisual">
          <div className="visualTop">
            <span>LIVE OPERATIONS</span>
            <span className="online">
              <i></i>
              ONLINE
            </span>
          </div>

          <div className="factoryGraphic">
            <div className="factoryBuilding buildingOne"></div>
            <div className="factoryBuilding buildingTwo"></div>
            <div className="factoryBuilding buildingThree"></div>

            <div className="factoryFloor"></div>
          </div>

          <div className="visualStats">
            <div>
              <span>Production</span>
              <strong>94.8%</strong>
            </div>

            <div>
              <span>System</span>
              <strong>Normal</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics">
        {metrics.map((metric) => (
          <div className="metric" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </div>
        ))}
      </section>

      <section id="company" className="section about">
        <div>
          <p className="sectionLabel">01 / COMPANY</p>

          <h2>
            Industrial capability.
            <br />
            Modern technology.
          </h2>
        </div>

        <div className="aboutText">
          <p>
            SecureFactory is a fictional industrial company created as a
            demonstration of a modern business website designed with
            usability, performance and security in mind.
          </p>

          <p>
            The project demonstrates how industrial companies can present
            their capabilities, operational information and security
            practices through a professional digital platform.
          </p>
        </div>
      </section>

      <section id="services" className="section">
        <p className="sectionLabel">02 / SERVICES</p>

        <div className="sectionHeading">
          <h2>Manufacturing services.</h2>

          <p>
            Practical industrial services built around reliability, quality
            and efficient operations.
          </p>
        </div>

        <div className="servicesGrid">
          {services.map((service) => (
            <article className="serviceCard" key={service.number}>
              <span>{service.number}</span>

              <h3>{service.title}</h3>

              <p>{service.text}</p>

              <a href="#contact">Learn more →</a>
            </article>
          ))}
        </div>
      </section>

      <section id="operations" className="operations">
        <div className="operationsInfo">
          <p className="sectionLabel">03 / OPERATIONS</p>

          <h2>
            Visibility into
            <br />
            production.
          </h2>

          <p>
            A modern industrial website can connect operational data,
            reporting and internal systems to provide clear business
            visibility.
          </p>

          <a href="#contact" className="secondaryButton">
            Discuss Automation
          </a>
        </div>

        <div className="dashboard">
          <div className="dashboardHeader">
            <div>
              <small>FACTORY OPERATIONS</small>
              <h3>Production Dashboard</h3>
            </div>

            <span className="online">
              <i></i>
              LIVE
            </span>
          </div>

          <div className="dashboardGrid">
            <div className="dashboardCard">
              <span>Output Today</span>
              <strong>12,480</strong>
              <small>Units produced</small>
            </div>

            <div className="dashboardCard">
              <span>Efficiency</span>
              <strong>94.8%</strong>
              <small>+2.4% this week</small>
            </div>

            <div className="dashboardCard">
              <span>Active Lines</span>
              <strong>08</strong>
              <small>8 / 8 operational</small>
            </div>
          </div>

          <div className="productionChart">
            <div className="chartHeader">
              <span>Production Performance</span>
              <span>Last 7 days</span>
            </div>

            <div className="bars">
              <div style={{ height: "46%" }}></div>
              <div style={{ height: "60%" }}></div>
              <div style={{ height: "55%" }}></div>
              <div style={{ height: "72%" }}></div>
              <div style={{ height: "67%" }}></div>
              <div style={{ height: "84%" }}></div>
              <div style={{ height: "94%" }}></div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className="section security">
        <div className="securityContent">
          <p className="sectionLabel">04 / SECURITY</p>

          <h2>
            Security is part
            <br />
            of the architecture.
          </h2>

          <p>
            The demonstration website includes production security
            configuration to reduce common browser and deployment risks.
          </p>
        </div>

        <div className="securityList">
          {securityItems.map((item) => (
            <div className="securityItem" key={item}>
              <span>✓</span>
              <p>{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="contact">
        <p className="sectionLabel">05 / CONTACT</p>

        <h2>
          Let's build something
          <br />
          reliable.
        </h2>

        <p>
          Need a modern website, business dashboard or security-focused
          digital solution?
        </p>

        <div className="heroActions">
          <a
            href="mailto:thvasawinter@gmail.com"
            className="primaryButton"
          >
            Contact Developer
          </a>

          <a
            href="https://github.com/bobsspx"
            target="_blank"
            rel="noopener noreferrer"
            className="secondaryButton"
          >
            GitHub
          </a>
        </div>
      </section>

      <footer>
        <div>
          <strong>
            SECURE<span>FACTORY</span>
          </strong>

          <p>Industrial digital experience demonstration.</p>
        </div>

        <div className="footerRight">
          <p>Portfolio demonstration project</p>
          <p>© 2026</p>
        </div>
      </footer>
    </main>
  );
}