SERVER_IP="172.17.0.2"
REMOTE_USER="semjasa"
REMOTE_DIR="/Users/semjasa/Library/Containers/Docker/Data/log"
LOCAL_DIR="/Users/semjasa/dev/devcraft/exercises"
SSH_KEY="/User/semjasa/.ssh/ssh-backup-lab.pub"

BACKUP_DIR="${LOCAL_DIR}/testscript/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/testscript"

echo "Starte Backup zu: $BACKUP_DIR"

scp -i "$SSH_KEY" -r ${REMOTE_USER}@${SERVER_IP}:"${REMOTE_DIR}" "${LOCAL_DIR}" 

# Überprüfen, ob das Backup erfolgreich war
if [ $? -eq 0 ]; then
  echo "Backup erfolgreich: ${BACKUP_DIR}"
else
  echo "Fehler beim Backup" >&2
  exit 1
fi