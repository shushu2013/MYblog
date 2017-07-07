#! /bin/sh

DAEMON="node cluster.js"
NAME=Microblog
DESC=Microblog
PIDFILE="microblog.pid"

case "$1" in
	start )
		echo "Starting $DESC: "
				nohup $DAEMON > /dev/null &
		echo $! > $PIDFILE
		echo "$NAME."
		;;
	stop )
		echo "Stoping $DESC: "
			pid=`cat $PIDFILE`
		kill $pid
		rm $PIDFILE
		echo "$NAME."
		;;
esac

exit 0