#!/bin/sh
# Useful functions for scripts

if [ -z $UZBL_SOCKET ]; then
  for file in /tmp/uzbl_socket_*; do
    UZBL_SOCKET=$file
  done
fi

print () {
    printf "%b" "$@"
}

error () {
    print "$@" >&2
}

sed_i () {
    local path="$1"
    readonly path

    local tmpfile="$( mktemp "$path.XXXXXX" )"
    readonly tmpfile

    sed "$@" < "$path" > "$tmpfile"
    mv "$tmpfile" "$path"
}

uzbl_send () {
    socat - "unix-connect:$UZBL_SOCKET"
}

uzbl_control () {
    echo "uzbl_control, doing: $@"
    print "$@" | uzbl_send
}

uzbl_escape () {
    sed -e 's/@/\\@/g'
}

echo "socket: $UZBL_SOCKET"

if [ $# -gt 0 ]; then
  uzbl_control $@
fi
