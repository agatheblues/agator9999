import React from 'react';
import PropTypes from 'prop-types';
require('./CopyToClipboard.scss');

class CopyToClipboard extends React.Component {

  constructor(props) {
    super();

    this.state = {
      copyLabel: 'Copy URI'
    };

    this.timer = null;

    this.copyToClipboard = this.copyToClipboard.bind(this);
    this.setReference = this.setReference.bind(this);
    this.updateCopyLabel = this.updateCopyLabel.bind(this);
  }

  updateCopyLabel() {
    this.setState({
      copyLabel: 'Copy URI'
    });
  }

  copyToClipboard(e) {
    e.preventDefault();

    const node = this.node;
    const range = document.createRange();
    const selection = window.getSelection();

    node.contentEditable = true;
    node.readOnly = false;

    range.selectNodeContents(this.node);
    selection.addRange(range);

    node.setSelectionRange(0, 100);
    node.select();
    node.contentEditable = false;
    node.readOnly = true;

    const successful = document.execCommand('copy');

    // Update label accordingly for 1000ms
    this.setState({
      copyLabel: successful ? 'Copied!' : 'Oops! Not copied.'
    });

    // Timeout to show original label
    this.timer = setTimeout(this.updateCopyLabel, 1000);

    selection.removeAllRanges();
  };

  setReference(node) {
    this.node = node;
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  render() {
    if (document.queryCommandSupported('copy')) {
      return (
        <div className='copyclipboard-container'>
          <p><a href='' onClick={this.copyToClipboard}>&#9741; {this.state.copyLabel}</a></p>
          <input
            type='text'
            readOnly={true}
            className='copyclipboard--hidden'
            ref={this.setReference}
            value={this.props.value}/>
        </div>
      );
    }

    return null;
  }

}

CopyToClipboard.propTypes = {
  value: PropTypes.string.isRequired
};

export default CopyToClipboard;
