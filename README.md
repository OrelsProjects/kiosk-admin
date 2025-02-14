## Firestore structure

devices -> deviceFingerprint -> actions -> [action-type] -> {history: [
    {
        id: string,
        data: Record<string, string>,
        timestamp: Date,
        didComplete: boolean,
    }
]}

devices -> deviceFingerprint -> signals -> [signal-type]/{history: [
    {
        id: string,
        data: Record<string, string>,
        timestamp: Date,
        didReceive: boolean,
    }
]}# kiosk-admin
