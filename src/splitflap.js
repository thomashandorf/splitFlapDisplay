class SplitFlapSegment {
    constructor(element, alphabet, initialValue) {
        this.element = element;
        this.alphabet = alphabet;
        this.currentValue = initialValue;
        if (this.checkValue(initialValue)) this.initialValue = this.alphabet[0];
        this.checkValue(initialValue);
        this.isFlipping = false;

        this.upperContainer = document.createElement('div');
        this.upperContainer.className = 'segment-tile upper';
        this.lowerContainer = document.createElement('div');
        this.lowerContainer.className = 'segment-tile lower';

        this.element.appendChild(this.upperContainer);
        this.element.appendChild(this.lowerContainer);

        this.upperContainer.append(this.createFlap(initialValue, 'upper'));
        this.lowerContainer.append(this.createFlap(initialValue, 'lower falling'));

    }

    checkValue(value) {
        return this.alphabet.indexOf(value)>=0;
    }

    createFlap(value, classes) {
        const flap = document.createElement('div');
        flap.className = `flap ${classes}`;
        flap.textContent = value;
        return flap;
    }

    update(value) {
        if (!this.checkValue(value)) return;
        const newUpperFlap = this.createFlap(value,'upper')
        const oldUpperFlap = this.upperContainer.firstChild;
        this.upperContainer.prepend(newUpperFlap);

        const newLowerFlap = this.createFlap(value,'lower')
        const oldLowerFlap = this.upperContainer.lastChild;
        this.lowerContainer.append(newLowerFlap);

        oldUpperFlap.classList.add('falling');

        this.currentValue = value;

        setTimeout(() => {
            newLowerFlap.classList.add('falling');
        }, 10);

        setTimeout(() => {
            oldUpperFlap.remove()
        }, 100); // note, this timing needs to fit to the animation timing

        setTimeout(() => {
            oldLowerFlap.remove()
        }, 160); // note, this timing needs to fit to the animation timing
    }

    flipTo(value) {
        if (this.isFlipping) return;
        this.isFlipping = true;
        if (!this.checkValue(value)) return;
        var mod = (n,m) => {
            return ((n % m) + m) % m; // extending regular n % m to negative range
        }
        const startIndex = this.alphabet.indexOf(this.currentValue);
        const endIndex = this.alphabet.indexOf(value);
        var dir=endIndex-startIndex>0 ? 1 : -1
        if (Math.abs(endIndex-startIndex)>this.alphabet.length/2) {
            dir*=-1 // reverse direction if running over 0 is shorter
        }

        const updateSequence = () => {
            if (this.currentValue === value) {
                clearInterval(intervalId);
                this.isFlipping = false;
                return;
            }

            const currentIndex = this.alphabet.indexOf(this.currentValue);
            const nextIndex = mod(currentIndex + dir, this.alphabet.length);
            this.update(this.alphabet[nextIndex]);
        };

        const intervalId = setInterval(updateSequence, 100); // Adjust time as necessary
    }
}

class SplitFlapDisplay {
    constructor(element, config) {
        this.element = element;
        this.segments = [];

        var children = Array.from(this.element.children).filter(child => child.classList.contains('segment'));
        const initialValues = typeof config.initialValue === 'string' ? 
                              (children.length === 1 ? [config.initialValue] : config.initialValue.split('')) : 
                              config.initialValue;
        
        // Create children if none exist and either initialValues is an array or numSegments is specified
        if (children.length === 0 && (initialValues.length > 0 || config.numSegments)) {
            const segmentCount = config.numSegments || initialValues.length;
            for (let i = 0; i < segmentCount; i++) {
                const segmentDiv = document.createElement('div');
                segmentDiv.className = 'segment';
                this.element.appendChild(segmentDiv);
            }
            children = Array.from(this.element.children).filter(child => child.classList.contains('segment'));
        }

        children.forEach((child, index) => {
            const alphabet = Array.isArray(config.alphabets) ? config.alphabets[index] : config.alphabet;
            const initialValue = initialValues[index] || alphabet[0]; // Default to first alphabet value if not enough initial values
            const segment = new SplitFlapSegment(child, alphabet, initialValue);
            this.segments.push(segment);
        });
    }
    flipTo(value) {
        const values = typeof value === 'string' ? 
                       (this.segments.length === 1 ? [value] : value.split('')) : 
                       value;

        this.segments.forEach((segment, index) => {
            if (index < values.length) {
                segment.flipTo(values[index]);
            }
        });
    }
}