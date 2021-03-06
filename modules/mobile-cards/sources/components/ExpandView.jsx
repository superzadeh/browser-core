import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import NativeDrawable, { normalizeUrl } from './custom/NativeDrawable';
import Link from './Link';
import { elementSideMargins } from '../styles/CardStyle';

export default class extends React.Component {

  constructor(props) {
    super(props);
    this.state = {collapsed: true};
  }

  render() {
    const isCollapsed = this.state.collapsed;
    const index = this.props.index;
    const arrowImage = normalizeUrl('arrow-down.svg');
    const style = styles(isCollapsed, index);
    return (
      <View style={style.container}>
        <Link
          onPress={() => this.setState({collapsed: !isCollapsed})}
        >
          <View style={style.header}>
            <View style={style.headerDetails}>
              { this.props.header }
            </View>
            <View style={style.headerExpand}>
              <NativeDrawable
                source={arrowImage}
                style={style.arrow}
              />
            </View>
          </View>
        </Link>
        { isCollapsed ||
          (
            <Link>
              <View style={style.content}>
                { this.props.content }
              </View>
            </Link>
          )
        }
      </View>
    );
  }
}

const styles = (collapsed = true, index) => StyleSheet.create({
  container: {
    borderTopWidth: index === 0 ? 1 : 0,
    borderBottomWidth: 1,
    borderTopColor: '#EDECEC',
    borderBottomColor: '#EDECEC',
    flex: 1,
  },
  headerText: {
    marginTop: 3,
    marginBottom: 3,
    color: 'black',
  },
  arrow: {
    height: 8,
    width: 12,
    transform: [{ rotateX: collapsed ? '0deg' : '180deg' }],
  },
  headerExpand: {
    alignItems: 'flex-end',
    flex: 1,
  },
  headerDetails: {
    flex: 10,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    ...elementSideMargins,
  },
  content: {
    ...elementSideMargins,
  },
  item: {
    color: 'black',
    marginTop: 12,
    ...elementSideMargins,
  },
});
