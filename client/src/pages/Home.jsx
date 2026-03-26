import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="mt-10 space-y-6 text-center">
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        Time-locked messages for your future moments.
      </h1>
      <p className="mx-auto max-w-xl text-sm text-slate-300">
        Create encrypted capsules that unlock at a precise time. Share a single secure link, optionally password-protect it,
        and even let it self-destruct after the first view.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/create"
          className="inline-flex items-center rounded-md bg-sky-500 px-5 py-2.5 text-sm font-medium text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400"
        >
          Create a Capsule
        </Link>
      </div>
    </section>
  );
};

export default Home;
