FROM fedora

ENV LANG en_US.UTF-8
CMD ["/usr/bin/node", "/usr/local/lib/terminal-slack/main.js"]

ADD / /usr/local/lib/terminal-slack/
RUN dnf install -y nodejs
