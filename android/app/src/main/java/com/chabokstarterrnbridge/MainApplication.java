package com.chabokstarterrnbridge;

import android.app.Application;
import android.app.Notification;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;

import com.adpdigital.push.AdpPushClient;
import com.adpdigital.push.ChabokNotification;
import com.adpdigital.push.ChabokNotificationAction;
import com.adpdigital.push.NotificationHandler;
import com.facebook.react.ReactApplication;
import com.adpdigital.push.rn.ChabokReactPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.adpdigital.push.PushMessage;
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {
    private AdpPushClient chabok = null;

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new ChabokReactPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        if (chabok == null) {
            chabok = AdpPushClient.init(
                    getApplicationContext(),
                    MainActivity.class,
                    "chabok-starter/839879285435",
                    "70df4ae2e1fd03518ce3e3b21ee7ca7943577749",
                    "chabok-starter",
                    "chabok-starter"
            );

            chabok.addNotificationHandler(new NotificationHandler(){
                @Override
                public boolean buildNotification(ChabokNotification chabokNotification, NotificationCompat.Builder builder) {
                    // use builder to customize the notification object
                    // return false to prevent this notification to be shown to the user, otherwise true
                    boolean isRichNotification = false;

                    if (chabokNotification.getExtras() != null) {
                        Bundle payload = chabokNotification.getExtras();

                        //FCM message data
                        isRichNotification = payload.containsKey("mediaUrl");
                    } else if (chabokNotification.getMessage() != null) {
                        PushMessage payload = chabokNotification.getMessage();

                        //Chabok message data
                        if (payload.getNotification() != null) {
                            isRichNotification = payload.getNotification().has("mediaUrl");
                        }
                    }

                    if (!isRichNotification) {
                        String notifText = chabokNotification.getText();
                        if (notifText != null) {
                            builder.setStyle(new NotificationCompat.BigTextStyle().bigText(notifText));
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
                                builder.setPriority(Notification.PRIORITY_MAX);
                            }
                        }
                    }

                    return super.buildNotification(chabokNotification, builder);
                }

                @Override
                public boolean notificationOpened(ChabokNotification message, ChabokNotificationAction notificationAction) {
                    ChabokReactPackage.notificationOpened(message, notificationAction);
                    return super.notificationOpened(message, notificationAction);
                }
            });
        }
    }

    @Override
    public void onTerminate() {
        if (chabok != null)
            chabok.dismiss();

        super.onTerminate();
    }
}
