import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createContactRouter } from './contact/router.js';
import { aboutPage, portrait, profileLinks } from './content/about.js';
import { navigation, principles, projectPlaceholders, services } from './content/home.js';
import { findPublishedProject, publishedProjects } from './content/projects.js';
import { processSteps, serviceDetails, servicesIntro } from './content/services.js';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));

export const site = {
  name: 'Amber Goding',
  role: 'Application & Automation Builder',
  description:
    'Amber Goding builds practical applications, AI integrations, and workflow automation that turn real-world problems into useful tools.',
};

/**
 * Build the Express application without starting a network listener,
 * so tests can run it on a temporary port.
 *
 * Options exist so tests can substitute their own pieces:
 * - `extendRoutes` mounts extra routes before the 404 and error handlers.
 * - `env`, `fetchImpl`, `now`, `logger`, and `contactOptions` configure the
 *   contact form (defaults: process.env, global fetch, Date.now, console).
 */
export function createApp({
  extendRoutes,
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = Date.now,
  logger = console,
  contactOptions,
} = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('view engine', 'ejs');
  app.set('views', path.join(projectRoot, 'views'));

  app.locals.site = site;
  app.locals.navigation = navigation;
  app.locals.currentYear = new Date().getFullYear();

  // Lets the shared header mark the current page in the navigation.
  app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
  });

  // Only the public directory is served as static files. Dotfiles are ignored.
  app.use(
    express.static(path.join(projectRoot, 'public'), {
      dotfiles: 'ignore',
      index: false,
    }),
  );

  app.get('/', (req, res) => {
    res.render('index', {
      title: `${site.name} | ${site.role}`,
      description: site.description,
      services,
      featuredProjects: publishedProjects,
      projectPlaceholders,
      principles,
    });
  });

  // Case studies exist only for published projects. Anything else falls
  // through to the standard 404 page.
  app.get('/projects/:slug', (req, res, next) => {
    const project = findPublishedProject(req.params.slug);
    if (!project) {
      return next();
    }
    res.render('project', {
      title: `${project.title} | ${site.name}`,
      description: project.description,
      project,
    });
  });

  app.get('/services', (req, res) => {
    res.render('services', {
      title: `Services | ${site.name}`,
      description:
        'Application development, AI integration, and workflow automation: who each service could help, the problems it addresses, and how a project works.',
      intro: servicesIntro,
      services: serviceDetails,
      processSteps,
    });
  });

  app.get('/about', (req, res) => {
    res.render('about', {
      title: `${aboutPage.title} | ${site.name}`,
      description:
        'Amber Goding is an application and automation builder who turns complicated problems into tools that make everyday work easier.',
      about: aboutPage,
      portrait,
      profileLinks,
    });
  });

  app.get('/healthz', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ status: 'ok' });
  });

  app.use(createContactRouter({ env, fetchImpl, now, logger, options: contactOptions }));

  if (extendRoutes) {
    extendRoutes(app);
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export function notFoundHandler(req, res) {
  res.status(404).render('error', {
    title: `Page not found | ${site.name}`,
    description: 'The page you requested could not be found.',
    status: 404,
    heading: 'Page not found',
    message: 'The page you’re looking for doesn’t exist or may have moved.',
  });
}

// Express recognizes error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const requested = err.status ?? err.statusCode;
  const status = Number.isInteger(requested) && requested >= 400 && requested < 500 ? requested : 500;

  if (status >= 500) {
    // Full details go to the server log only, never to the visitor.
    console.error(err);
  }

  const heading = status === 500 ? 'Something went wrong' : 'Request could not be completed';

  res.status(status).render('error', {
    title: `${heading} | ${site.name}`,
    description: heading,
    status,
    heading,
    message:
      status === 500
        ? 'An unexpected error occurred. Please try again later.'
        : 'The request could not be processed.',
  });
}
