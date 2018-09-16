import React from 'react';
import chabokpush from 'react-native-chabok';
import {StyleSheet, Button, Text, View, TextInput, NativeEventEmitter, NativeModules} from 'react-native';

export default class App extends React.Component {

    constructor() {
        super();

        this.state = {
            tagName: 'FREE',
            userId: undefined,
            channel: undefined,
            connectionColor: 'red',
            messageReceived: undefined,
            connectionState: 'Disconnected',
            messageBody: 'Hello world Message'
        };
    }

    componentDidMount() {
        this.initChabok();
    }

    initChabok() {
        const options = {
            appId: 'chabok-starter/339811759516',
            username: 'chabok-starter',
            password: 'chabok-starter',
            apiKey: '70df4ae2e1fd03518ce3e3b21ee7ca7943577749'
        };
        this.chabok = new chabokpush.AdpPushClient();

        this.chabok.setDevelopment(true);

        this.chabok.init(options.appId, options.apiKey, options.username, options.password)
            .then((state) => {
                console.log(state);
            })
            .catch((error) => {
                console.log(error);
            });

        const chabokEmitter = new NativeEventEmitter(NativeModules.AdpPushClient);

        chabokEmitter.addListener(
            'connectionStatus',
            (status) => {
                let connectionColor = 'red';
                let connectionState = 'error';

                if (status === 'CONNECTED') {
                    connectionColor = 'green';
                    connectionState = 'Connected';
                } else if (status === 'CONNECTING') {
                    connectionColor = 'yellow';
                    connectionState = 'Connecting';
                } else if (status === 'DISCONNECTED') {
                    connectionColor = 'red';
                    connectionState = 'Disconnected';
                }

                this.setState({
                    connectionColor,
                    connectionState
                });
            }
        );

        chabokEmitter.addListener(
            'ChabokMessageReceived',
            (msg) => {
                const messageJson = this.getMessages() + JSON.stringify(msg);
                this.setState({messageReceived: messageJson});
            }
        );

        this.chabok.getUserId()
            .then(userId => {
                if (userId) {
                    this.setState({userId});
                    this.chabok.register(userId);
                }
            })
            .catch();
    }

    //  ----------------- Register Group -----------------
    onRegisterTapped() {
        const {userId} = this.state;
        if (userId) {
            this.chabok.register(userId);
        } else {
            console.warn('The userId is undefined');
        }
    }

    onUnregisterTapped() {
        this.chabok.unregister();
    }

    onSubscribeTapped() {
        if (this.state.channel) {
            this.chabok.subscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }

    onUnsubscribeTapped() {
        if (this.state.channel) {
            this.chabok.unSubscribe(this.state.channel);
        } else {
            console.warn('The channel name is undefined');
        }
    }

    // ----------------- Publish Group -----------------
    onPublishTapped() {
        const msg = {
            channel: "default",
            userId: this.state.userId,
            content: this.state.messageBody || 'Hello world'
        };
        this.chabok.publish(msg)
    }

    // onPublishEventTapped() {
    //     this.chabok.publishEvent('batteryStatus', {state: 'charging'});
    // }

    //  ----------------- Tag Group -----------------
    onAddTagTapped() {
        if (this.state.tagName) {
            this.chabok.addTag(this.state.tagName)
                .then(res => {
                    alert(this.state.tagName + ' tag was assign to ' + this.getUserId() + ' user');
                })
                .catch(_ => console.warn("An error happend adding tag ...",_));
        } else {
            console.warn('The tagName is undefined');
        }
    }

    onRemoveTagTapped() {
        if (this.state.tagName) {
            this.chabok.removeTag(this.state.tagName)
                .then(res => {
                    alert(this.state.tagName + ' tag was removed from ' + this.getUserId() + ' user');
                })
                .catch(_ => console.warn("An error happend removing tag ..."));
        } else {
            console.warn('The tagName is undefined');
        }
    }

    //  ----------------- Track Group -----------------
    onAddToCartTrackTapped() {
        this.chabok.track('AddToCard', {order: '200'});
    }

    onPurchaseTrackTapped() {
        this.chabok.track('Purchase', {price: '15000'});
    }

    onCommentTrackTapped() {
        this.chabok.track('Comment', {postId: '1234555677754d'});
    }

    onLikeTrackTapped() {
        this.chabok.track('Like', {postId: '1234555677754d'});
    }

    getUserId() {
        return this.state.userId || ''
    }

    getMessages() {
        if (this.state.messageReceived) {
            return this.state.messageReceived + '\n --------- \n\n';
        }
        return '';
    }

    getTagName() {
        return this.state.tagName || '';
    }

    getMessageBody() {
        return this.state.messageBody || '';
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.nestedButtonView} marginTop={-10}>
                    <View style={styles.circleView} backgroundColor={this.state.connectionColor}/>
                    <Text>{this.state.connectionState}</Text>
                </View>
                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        placeholder="User id"
                        width="60%"
                        onChangeText={userId => this.setState({userId})}>{this.getUserId()}</TextInput>
                    <TextInput
                        style={styles.input}
                        width="40%"
                        placeholder="Channel name"
                        onChangeText={channel => this.setState({channel})}/>
                </View>

                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="Register"
                        onPress={this.onRegisterTapped.bind(this)}/>
                    <Button
                        style={styles.button}
                        title="Unregister"
                        onPress={this.onUnregisterTapped.bind(this)}/>
                    <Button
                        style={styles.button}
                        title="Sub"
                        onPress={this.onSubscribeTapped.bind(this)}/>
                    <Button
                        style={styles.button}
                        title="Unsub"
                        onPress={this.onUnsubscribeTapped.bind(this)}/>
                </View>

                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        onChangeText={messageBody => this.setState({messageBody})}
                        width="100%">{this.getMessageBody()}</TextInput>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="Publish"
                        onPress={this.onPublishTapped.bind(this)}/>
                </View>
                <View style={styles.nestedButtonView}>
                    <TextInput
                        style={styles.input}
                        placeholder='Tag name'
                        onChangeText={tagName => this.setState({tagName})}
                        width='100%'>{this.getTagName()}</TextInput>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button
                        style={styles.button}
                        title="AddTag"
                        onPress={this.onAddTagTapped.bind(this)}/>
                    <Button
                        style={styles.button}
                        title="RemoveTag"
                        onPress={this.onRemoveTagTapped.bind(this)}/>
                </View>
                <View style={styles.nestedButtonView}>
                    <Text>Track user: </Text>
                </View>
                <View style={styles.nestedButtonView}>
                    <Button style={styles.button} title="AddToCart" onPress={this.onAddToCartTrackTapped.bind(this)}/>
                    <Button style={styles.button} title="Purchase" onPress={this.onPurchaseTrackTapped.bind(this)}/>
                    <Button style={styles.button} title="Comment" onPress={this.onCommentTrackTapped.bind(this)}/>
                    <Button style={styles.button} title="Like" onPress={this.onLikeTrackTapped.bind(this)}/>
                </View>
                <View>
                    <Text style={styles.textView}>{this.getMessages()}</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
        paddingRight: 12,
        paddingLeft: 12,
        paddingBottom: 12,
        width: '100%',
    },
    nestedButtonView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    circleView: {
        width: 15,
        height: 15,
        borderRadius: 8,
        marginTop: 10,
        marginBottom: 10,
        marginRight: 10,
        marginLeft: 4
    },
    button: {
        padding: 2,
        marginLeft: 2,
        marginRight: 2
    },
    textView: {
        borderColor: 'rgba(127,127,127,0.3)',
        backgroundColor: 'rgba(127,127,127,0.06)',
        width: '100%',
        height: '70%',
    },
    input: {
        padding: 4,
        height: 40,
        borderColor: 'rgba(127,127,127,0.3)',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 0,
        marginRight: 5,
        marginLeft: 0
    }
});