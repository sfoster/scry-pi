Scry-Pi
=======

An experimental test-bed for IoT / Smart Home technologies. This project should end up with a "smart" mirror which displays various remote and home-sourced real-time data on a dashboard. The mirror form-factor implies limited direct input.

Status:
-------

Early prototyping and exploration, *nothing* is stable and its expected that various pieces - including the install & start scripts - may not work at any given time

Install & Setup
---------------

While some parts of the project may run on any *nix environment, the current target platform is a Raspberry Pi 2. Check out the repo and...

```
$ sudo ./install.sh
```

Everything should start automatically on reboot, as the installer registers services in /etc/init.d, and establishes a .xsession file for the 'pi' user to start up everything else.

To hook up sensors, see io-scripts/config for the current configuration. To add/edit the dashboard itself, see socket-board/config/dashboard.json and corresponding routes in socket-board/app.js



