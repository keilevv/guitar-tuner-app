function Footer() {
  return (
    <footer className="flex justify-center mt-4 flex-col items-center gap-2">
      <p className="text-sm text-gray-500">Made with ❤️ by Keilev </p>
      <p className="text-sm text-gray-500">
        Follow me on{" "}
        <a
          href="https://github.com/Keilevv"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white font-semibold hover:underline"
        >
          GitHub
        </a>
      </p>
    </footer>
  );
}
export default Footer;
