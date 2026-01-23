with import <nixpkgs> {}; {
  my_shell = stdenv.mkDerivation {
    name = "build-env";
    buildInputs = [
      jekyll
      bundler
    ];
  };
}