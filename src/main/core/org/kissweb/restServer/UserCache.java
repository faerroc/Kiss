package org.kissweb.restServer;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Hashtable;

/**
 * This class manages all the users currently logged into the system.
 * <br><br>
 * Author: Blake McBride<br>
 * Date: 3/23/18
 */
public class UserCache {

    private static final Hashtable<String, UserData> uuidTable = new Hashtable<>();
    private static LocalDateTime lastPurge = LocalDateTime.now();
    private static int inactiveUserMaxSeconds;

    static public UserData newUser(String user, String pw, Object userId) {
        UserData ud = new UserData(user, pw, userId);
        uuidTable.put(ud.getUuid(), ud);
        return ud;
    }

    static UserData findUser(String uuid) {
        UserData ud;
        purgeOld();
        ud = uuidTable.get(uuid);
        return ud;
    }

    static void removeUser(String uuid) {
        uuidTable.remove(uuid);
    }

    private static void purgeOld() {
        // Don't purge more than once per minute
        if (60 > ChronoUnit.SECONDS.between(lastPurge, LocalDateTime.now()))
            return;
        ArrayList<String> purge = new ArrayList<>();
        LocalDateTime old = LocalDateTime.now();
        int maxSeconds = inactiveUserMaxSeconds;
        if (maxSeconds == 0)
            maxSeconds = 3600;  // no more than 60 minutes
        old = old.minusSeconds(maxSeconds);
        for (UserData ud : uuidTable.values())
            if (ud.getLastAccessDate().isBefore(old))
                purge.add(ud.getUuid());
        for (String s : purge)
            uuidTable.remove(s);
        lastPurge = LocalDateTime.now();
    }

    public static void setInactiveUserMaxSeconds(int inactiveUserMaxSeconds) {
        UserCache.inactiveUserMaxSeconds = inactiveUserMaxSeconds;
    }
}
